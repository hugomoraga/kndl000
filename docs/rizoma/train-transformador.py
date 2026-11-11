#!/usr/bin/env python3
"""Entrena un transformer mínimo, carácter por carácter, sobre corpus.txt.

No es un modelo de lenguaje grande: es una sola capa, una sola cabeza y un
contexto corto. Sirve para ver el mecanismo —atención, transformación,
pérdida— y para generar una sombra del corpus.

Uso:
    python3 -m venv .venv-train
    .venv-train/bin/pip install numpy
    .venv-train/bin/python docs/rizoma/train-transformador.py

Salida:
    assets/models/transformador.json
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
CORPUS = ROOT / "corpus.txt"
OUT = ROOT / "assets/models/transformador.json"

CONFIG = {
    "context": 40,
    "d_model": 64,
    "d_ff": 128,
    "layers": 2,
    "batch": 32,
    "steps": 12000,
    "lr": 2e-3,
    "seed": 7,
}

EPS = 1e-6


# ---------------------------------------------------------------------------
# Módulos
# ---------------------------------------------------------------------------

def rmsnorm_forward(x: np.ndarray, gamma: np.ndarray):
    rms = np.sqrt(np.mean(x * x, axis=-1, keepdims=True) + EPS)
    y = x / rms * gamma
    return y, (x, rms)


def rmsnorm_backward(dy: np.ndarray, cache, gamma: np.ndarray):
    x, rms = cache
    d = x.shape[-1]
    dgamma = np.sum(dy * x / rms, axis=tuple(range(dy.ndim - 1)))
    dx = (dy * gamma) / rms - x * np.sum(dy * gamma * x, axis=-1, keepdims=True) / (d * rms ** 3)
    return dx, dgamma


def softmax(x: np.ndarray):
    z = x - np.max(x, axis=-1, keepdims=True)
    e = np.exp(z)
    return e / np.sum(e, axis=-1, keepdims=True)


def softmax_backward(dy: np.ndarray, y: np.ndarray):
    return y * (dy - np.sum(dy * y, axis=-1, keepdims=True))


def linear_forward(x: np.ndarray, w: np.ndarray, b: np.ndarray):
    return x @ w + b


def linear_backward(dy: np.ndarray, x: np.ndarray, w: np.ndarray):
    x2 = x.reshape(-1, x.shape[-1])
    dy2 = dy.reshape(-1, dy.shape[-1])
    dw = x2.T @ dy2
    db = dy2.sum(axis=0)
    dx = dy @ w.T
    return dx, dw, db


# ---------------------------------------------------------------------------
# Modelo
# ---------------------------------------------------------------------------

class TinyTransformer:
    def __init__(self, vocab_size: int, cfg: dict, seed: int = 0):
        self.cfg = dict(cfg)
        self.vocab_size = vocab_size
        self.rng = np.random.default_rng(seed)
        self.params = self._init_params()

    def _randn(self, *shape, scale=0.02):
        return (self.rng.standard_normal(shape) * scale).astype(np.float64)

    def _init_params(self):
        d = self.cfg["d_model"]
        f = self.cfg["d_ff"]
        t = self.cfg["context"]
        v = self.vocab_size
        p = {
            "tok_emb": self._randn(v, d),
            "pos_emb": self._randn(t, d, scale=0.01),
            "lnf": np.ones(d, dtype=np.float64),
            "Wout": self._randn(d, v),
            "bout": np.zeros(v, dtype=np.float64),
        }
        for layer in range(self.cfg["layers"]):
            p[f"ln1_{layer}"] = np.ones(d, dtype=np.float64)
            p[f"Wq_{layer}"] = self._randn(d, d)
            p[f"bq_{layer}"] = np.zeros(d, dtype=np.float64)
            p[f"Wk_{layer}"] = self._randn(d, d)
            p[f"bk_{layer}"] = np.zeros(d, dtype=np.float64)
            p[f"Wv_{layer}"] = self._randn(d, d)
            p[f"bv_{layer}"] = np.zeros(d, dtype=np.float64)
            p[f"Wo_{layer}"] = self._randn(d, d)
            p[f"bo_{layer}"] = np.zeros(d, dtype=np.float64)
            p[f"ln2_{layer}"] = np.ones(d, dtype=np.float64)
            p[f"W1_{layer}"] = self._randn(d, f)
            p[f"b1_{layer}"] = np.zeros(f, dtype=np.float64)
            p[f"W2_{layer}"] = self._randn(f, d)
            p[f"b2_{layer}"] = np.zeros(d, dtype=np.float64)
        return p

    # -- forward -----------------------------------------------------------
    def forward(self, x: np.ndarray):
        cfg = self.cfg
        p = self.params
        b, t = x.shape
        d = cfg["d_model"]
        h = p["tok_emb"][x] + p["pos_emb"][:t]
        caches = {"x": x, "h0": h, "layers": []}

        for layer in range(cfg["layers"]):
            n1, c1 = rmsnorm_forward(h, p[f"ln1_{layer}"])
            q = n1 @ p[f"Wq_{layer}"] + p[f"bq_{layer}"]
            k = n1 @ p[f"Wk_{layer}"] + p[f"bk_{layer}"]
            v = n1 @ p[f"Wv_{layer}"] + p[f"bv_{layer}"]
            scores = q @ k.transpose(0, 2, 1) / math.sqrt(d)
            mask = np.triu(np.ones((t, t), dtype=bool), k=1)
            scores = np.where(mask[None, :, :], -1e9, scores)
            attn = softmax(scores)
            ctx = attn @ v
            attn_out = ctx @ p[f"Wo_{layer}"] + p[f"bo_{layer}"]
            h1 = h + attn_out

            n2, c2 = rmsnorm_forward(h1, p[f"ln2_{layer}"])
            pre = n2 @ p[f"W1_{layer}"] + p[f"b1_{layer}"]
            rel = np.maximum(pre, 0)
            ff_out = rel @ p[f"W2_{layer}"] + p[f"b2_{layer}"]
            h2 = h1 + ff_out

            caches["layers"].append({
                "h_in": h,
                "c1": c1,
                "n1": n1,
                "q": q,
                "k": k,
                "v": v,
                "attn": attn,
                "ctx": ctx,
                "h1": h1,
                "c2": c2,
                "n2": n2,
                "pre": pre,
                "rel": rel,
            })
            h = h2

        nf, cf = rmsnorm_forward(h, p["lnf"])
        logits = nf @ p["Wout"] + p["bout"]
        caches["nf"] = nf
        caches["cf"] = cf
        return logits, caches

    # -- loss + backward ---------------------------------------------------
    def loss_and_grad(self, x: np.ndarray, y: np.ndarray):
        cfg = self.cfg
        p = self.params
        b, t = x.shape
        v = self.vocab_size
        logits, caches = self.forward(x)
        logits_flat = logits.reshape(-1, v)
        y_flat = y.reshape(-1)
        probs = softmax(logits_flat)
        rows = np.arange(y_flat.size)
        loss = -np.mean(np.log(probs[rows, y_flat] + 1e-12))

        dlogits = probs
        dlogits[rows, y_flat] -= 1
        dlogits /= y_flat.size

        grads = {}
        dnf, grads["Wout"], grads["bout"] = linear_backward(
            dlogits.reshape(b, t, v), caches["nf"], p["Wout"]
        )
        dh, grads["lnf"] = rmsnorm_backward(dnf, caches["cf"], p["lnf"])

        for layer in reversed(range(cfg["layers"])):
            c = caches["layers"][layer]
            dh2 = dh
            dh1 = dh2
            dff = dh2

            da, grads[f"W2_{layer}"], grads[f"b2_{layer}"] = linear_backward(
                dff, c["rel"], p[f"W2_{layer}"]
            )
            dpre = da * (c["pre"] > 0)
            dn2, grads[f"W1_{layer}"], grads[f"b1_{layer}"] = linear_backward(
                dpre, c["n2"], p[f"W1_{layer}"]
            )
            dx, grads[f"ln2_{layer}"] = rmsnorm_backward(dn2, c["c2"], p[f"ln2_{layer}"])
            dh1 = dh1 + dx

            dattn_out = dh1
            dctx, grads[f"Wo_{layer}"], grads[f"bo_{layer}"] = linear_backward(
                dattn_out, c["ctx"], p[f"Wo_{layer}"]
            )
            dattn = dctx @ c["v"].transpose(0, 2, 1)
            dv = c["attn"].transpose(0, 2, 1) @ dctx
            dscores = softmax_backward(dattn, c["attn"]) / math.sqrt(cfg["d_model"])
            dq = dscores @ c["k"]
            dk = dscores.transpose(0, 2, 1) @ c["q"]

            dq, grads[f"Wq_{layer}"], grads[f"bq_{layer}"] = linear_backward(
                dq, c["n1"], p[f"Wq_{layer}"]
            )
            dk, grads[f"Wk_{layer}"], grads[f"bk_{layer}"] = linear_backward(
                dk, c["n1"], p[f"Wk_{layer}"]
            )
            dv, grads[f"Wv_{layer}"], grads[f"bv_{layer}"] = linear_backward(
                dv, c["n1"], p[f"Wv_{layer}"]
            )
            dn1 = dq + dk + dv
            dx, grads[f"ln1_{layer}"] = rmsnorm_backward(
                dn1, c["c1"], p[f"ln1_{layer}"]
            )
            dh = dh1 + dx

        dtok = dh
        dpos = np.sum(dh, axis=0)
        dtok_emb = np.zeros_like(p["tok_emb"])
        np.add.at(dtok_emb, x, dtok)
        grads["tok_emb"] = dtok_emb
        grads["pos_emb"] = dpos
        return float(loss), grads, caches

    # -- generation --------------------------------------------------------
    def generate(self, ids: list[int], length: int, temperature: float = 0.8):
        ctx = self.cfg["context"]
        out = list(ids)
        last_attn = None
        for _ in range(length):
            window = out[-ctx:]
            if len(window) < ctx:
                window = [0] * (ctx - len(window)) + window
            x = np.array([window], dtype=np.int32)
            logits, caches = self.forward(x)
            row = logits[0, -1] / max(temperature, 1e-3)
            probs = softmax(row)
            nxt = int(self.rng.choice(self.vocab_size, p=probs))
            out.append(nxt)
            last_attn = caches["layers"][0]["attn"][0]
        return out, last_attn


# ---------------------------------------------------------------------------
# Entrenamiento
# ---------------------------------------------------------------------------

def build_data():
    text = CORPUS.read_text(encoding="utf-8").replace("\r\n", "\n")
    vocab = sorted(set(text))
    stoi = {c: i for i, c in enumerate(vocab)}
    data = np.array([stoi[c] for c in text], dtype=np.int32)
    split = int(len(data) * 0.95)
    return text, vocab, stoi, data[:split], data[split:]


def sample_batch(data: np.ndarray, batch: int, context: int, rng: np.random.Generator):
    max_start = len(data) - context - 1
    starts = rng.integers(0, max_start, size=batch)
    x = np.stack([data[i:i + context] for i in starts])
    y = np.stack([data[i + 1:i + context + 1] for i in starts])
    return x, y


def loss_only(model: TinyTransformer, data: np.ndarray, batch: int, context: int, rng: np.random.Generator):
    x, y = sample_batch(data, batch, context, rng)
    logits, _ = model.forward(x)
    probs = softmax(logits.reshape(-1, model.vocab_size))
    y_flat = y.reshape(-1)
    rows = np.arange(y_flat.size)
    return float(-np.mean(np.log(probs[rows, y_flat] + 1e-12)))


def train(model: TinyTransformer, train_data: np.ndarray, val_data: np.ndarray):
    cfg = model.cfg
    rng = np.random.default_rng(cfg["seed"] + 1)
    lr = cfg["lr"]
    beta1, beta2 = 0.9, 0.999
    eps = 1e-8
    m = {k: np.zeros_like(v) for k, v in model.params.items()}
    v = {k: np.zeros_like(v) for k, v in model.params.items()}
    step = 0
    for step in range(1, cfg["steps"] + 1):
        x, y = sample_batch(train_data, cfg["batch"], cfg["context"], rng)
        loss, grads, _ = model.loss_and_grad(x, y)
        norm = math.sqrt(sum(float(np.sum(g * g)) for g in grads.values()))
        clip = 1.0
        if norm > clip:
            scale = clip / (norm + 1e-12)
            for k in grads:
                grads[k] *= scale
        for k in model.params:
            g = grads[k]
            m[k] = beta1 * m[k] + (1 - beta1) * g
            v[k] = beta2 * v[k] + (1 - beta2) * (g * g)
            mhat = m[k] / (1 - beta1 ** step)
            vhat = v[k] / (1 - beta2 ** step)
            model.params[k] -= lr * mhat / (np.sqrt(vhat) + eps)
        if step % 100 == 0 or step == 1:
            val = loss_only(model, val_data, cfg["batch"], cfg["context"], rng)
            print(f"step {step:4d} · loss {loss:.4f} · val {val:.4f} · lr {lr:.2e}")
        if step == int(cfg["steps"] * 0.7):
            lr *= 0.5
    model.val_loss = loss_only(model, val_data, cfg["batch"], cfg["context"], rng)
    print(f"validación final · {model.val_loss:.4f}")
    return model


# ---------------------------------------------------------------------------
# Grad check
# ---------------------------------------------------------------------------

def gradcheck():
    cfg = {"context": 4, "d_model": 4, "d_ff": 6, "layers": 1}
    model = TinyTransformer(5, cfg, seed=3)
    rng = np.random.default_rng(4)
    x = rng.integers(0, 5, size=(2, 4)).astype(np.int32)
    y = rng.integers(0, 5, size=(2, 4)).astype(np.int32)
    loss, grads, _ = model.loss_and_grad(x, y)
    names = ["tok_emb", "pos_emb", "W1_0", "Wq_0", "ln1_0", "Wout"]
    print(f"loss {loss:.6f}")
    for name in names:
        p = model.params[name]
        idx = tuple(rng.integers(0, s) for s in p.shape)
        old = p[idx]
        eps = 1e-5
        p[idx] = old + eps
        lp, _, _ = model.loss_and_grad(x, y)
        p[idx] = old - eps
        lm, _, _ = model.loss_and_grad(x, y)
        p[idx] = old
        numeric = (lp - lm) / (2 * eps)
        analytic = grads[name][idx]
        err = abs(numeric - analytic) / max(1e-8, abs(numeric) + abs(analytic))
        print(f"{name:8s} idx={idx} numeric={numeric:+.6f} analytic={analytic:+.6f} err={err:.2e}")


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------

def export(model: TinyTransformer, vocab: list[str], stoi: dict[str, int], text: str):
    cfg = dict(model.cfg)
    cfg["vocab_size"] = len(vocab)
    cfg["val_loss"] = round(float(getattr(model, "val_loss", 0.0)), 4)
    weights = {}
    for k, arr in model.params.items():
        weights[k] = np.round(arr, 5).tolist()
    payload = {
        "config": cfg,
        "vocab": vocab,
        "weights": weights,
        "trained_on": "corpus.txt",
        "sample_seed": "lo que se guarda no es lo que se recuerda",
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"modelo exportado: {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")
    seed = payload["sample_seed"]
    ids = [stoi[c] for c in seed if c in stoi]
    out, _ = model.generate(ids, 120, 0.8)
    print("muestra:")
    print("".join(vocab[i] for i in out))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gradcheck", action="store_true")
    ap.add_argument("--steps", type=int, default=CONFIG["steps"])
    args = ap.parse_args()
    if args.gradcheck:
        gradcheck()
        return
    cfg = dict(CONFIG)
    cfg["steps"] = args.steps
    text, vocab, stoi, train_data, val_data = build_data()
    print(f"corpus: {len(text)} caracteres · vocab: {len(vocab)} · train: {len(train_data)} · val: {len(val_data)}")
    model = TinyTransformer(len(vocab), cfg, seed=cfg["seed"])
    train(model, train_data, val_data)
    export(model, vocab, stoi, text)


if __name__ == "__main__":
    main()
