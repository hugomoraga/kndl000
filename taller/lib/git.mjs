import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ENV = {
  ...process.env,
  GIT_PAGER: "cat",
  GIT_TERMINAL_PROMPT: "0"
};

export function run(command, args, { cwd, timeout = 180000 } = {}) {
  return new Promise((resolvePromise) => {
    execFile(
      command,
      args,
      { cwd, env: ENV, timeout, maxBuffer: 20 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const code = error?.code ?? 0;
        resolvePromise({
          command,
          args,
          code,
          ok: !error,
          stdout: String(stdout ?? ""),
          stderr: String(stderr ?? ""),
          error: error ? error.message : null
        });
      }
    );
  });
}

export function git(root, args, options = {}) {
  return run("git", args, { cwd: root, ...options });
}

export async function isGitRepo(root) {
  const result = await git(root, ["rev-parse", "--is-inside-work-tree"]);
  return result.ok && result.stdout.trim() === "true";
}

export async function headSha(root) {
  const result = await git(root, ["rev-parse", "HEAD"]);
  return result.ok ? result.stdout.trim() : null;
}

export async function isTracked(root, path) {
  const result = await git(root, ["ls-files", "--error-unmatch", "--", path]);
  return result.ok;
}

export async function headContent(root, path) {
  const result = await git(root, ["show", `HEAD:${path}`]);
  return result.ok ? result.stdout : null;
}

export async function diffForPaths(root, paths) {
  const chunks = [];
  for (const path of paths) {
    const tracked = await isTracked(root, path);
    if (tracked) {
      const result = await git(root, ["diff", "--no-color", "--", path]);
      if (result.stdout) chunks.push(result.stdout.trimEnd());
      continue;
    }
    if (!existsSync(join(root, path))) continue;
    const result = await git(root, [
      "diff",
      "--no-color",
      "--no-index",
      "--",
      "/dev/null",
      path
    ]);
    if (result.stdout) chunks.push(result.stdout.trimEnd());
  }
  return chunks.length ? `${chunks.join("\n")}\n` : "";
}

export async function statusPorcelain(root) {
  const result = await git(root, ["status", "--porcelain=v1", "--untracked-files=all"]);
  if (!result.ok) return [];
  return result.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const status = line.slice(0, 2);
      const parts = line.slice(3).split(" -> ");
      const path = parts.pop();
      return {
        status,
        path,
        original: parts.length > 0 ? parts.join(" -> ") : null,
        renamed: status.includes("R"),
        raw: line
      };
    });
}

export async function repoState(root) {
  const repo = await isGitRepo(root);
  if (!repo) {
    return {
      isRepo: false,
      branch: null,
      detached: true,
      head: null,
      merge: false,
      rebase: false,
      cherryPick: false,
      revert: false,
      conflicts: [],
      dirty: [],
      blockReason: "El taller debe correr dentro del repo git."
    };
  }

  const [branchResult, head, gitDirResult, conflictsResult, dirty] = await Promise.all([
    git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"]),
    headSha(root),
    git(root, ["rev-parse", "--absolute-git-dir"]),
    git(root, ["diff", "--name-only", "--diff-filter=U"]),
    statusPorcelain(root)
  ]);

  const gitDir = gitDirResult.ok ? gitDirResult.stdout.trim() : join(root, ".git");
  const merge = existsSync(join(gitDir, "MERGE_HEAD"));
  const rebase =
    existsSync(join(gitDir, "rebase-merge")) || existsSync(join(gitDir, "rebase-apply"));
  const cherryPick = existsSync(join(gitDir, "CHERRY_PICK_HEAD"));
  const revert = existsSync(join(gitDir, "REVERT_HEAD"));
  const detached = !branchResult.ok;
  const conflicts = conflictsResult.ok
    ? conflictsResult.stdout.split("\n").filter(Boolean)
    : [];

  let blockReason = null;
  if (detached) {
    blockReason = "HEAD está detached. Creá o cambiá a una rama antes de commitear o pushear.";
  } else if (merge) {
    blockReason = "Hay un merge en curso. Resolvé y terminá el merge antes de commitear.";
  } else if (rebase) {
    blockReason = "Hay un rebase en curso. Resolvé y terminá el rebase antes de commitear.";
  } else if (cherryPick) {
    blockReason = "Hay un cherry-pick en curso. Terminalo antes de commitear.";
  } else if (revert) {
    blockReason = "Hay un revert en curso. Terminalo antes de commitear.";
  } else if (conflicts.length > 0) {
    blockReason = `Hay conflictos sin resolver: ${conflicts.join(", ")}.`;
  }

  return {
    isRepo: true,
    branch: branchResult.ok ? branchResult.stdout.trim() : null,
    detached,
    head,
    merge,
    rebase,
    cherryPick,
    revert,
    conflicts,
    dirty,
    renames: dirty.filter((item) => item.renamed),
    blockReason
  };
}

export async function restorePath(root, path) {
  const tracked = await isTracked(root, path);
  if (!tracked) {
    const { unlinkSync } = await import("node:fs");
    const abs = join(root, path);
    if (existsSync(abs)) unlinkSync(abs);
    return { deleted: true, tracked: false };
  }
  const result = await git(root, [
    "restore",
    "--source=HEAD",
    "--staged",
    "--worktree",
    "--",
    path
  ]);
  if (!result.ok) throw new Error(result.stderr || result.stdout || "git restore falló");
  return { deleted: false, tracked: true };
}

export async function stageAndCommit(root, paths, message) {
  const added = await git(root, ["add", "--", ...paths]);
  if (!added.ok) throw new Error(added.stderr || added.stdout || "git add falló");
  const committed = await git(root, ["commit", "-m", message, "--", ...paths]);
  if (!committed.ok) throw new Error(committed.stderr || committed.stdout || "git commit falló");
  return { stdout: committed.stdout, stderr: committed.stderr };
}

export async function commitsAhead(root, limit = 50) {
  const upstreamResult = await git(root, [
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{upstream}"
  ]);
  const upstream = upstreamResult.ok ? upstreamResult.stdout.trim() : null;
  if (!upstream) return { upstream: null, commits: [], error: null };

  const log = await git(root, [
    "log",
    "--no-color",
    "--format=%h%x09%cs%x09%s",
    "-n",
    String(limit),
    `${upstream}..HEAD`
  ]);
  if (!log.ok) {
    return {
      upstream,
      commits: [],
      error: log.stderr.trim() || log.stdout.trim() || "git log falló"
    };
  }

  const commits = log.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...rest] = line.split("\t");
      return { hash, date, subject: rest.join("\t") };
    });
  return { upstream, commits, error: null };
}

export async function push(root) {
  const result = await git(root, ["push"]);
  if (!result.ok) throw new Error(result.stderr || result.stdout || "git push falló");
  return { stdout: result.stdout, stderr: result.stderr };
}
