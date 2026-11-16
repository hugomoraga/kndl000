require "yaml"
require "date"

module KNDL
  # Genera una vista de trabajo para cada cartografía revisada y publicable.
  # No expone la trama completa: solo el artefacto de cartografía.
  class RizomaCartografiaGenerator < Jekyll::Generator
    safe true
    priority :normal

    def generate(site)
      cartographies = load_cartographies(site.source)
      return if cartographies.empty?

      trama = load_trama(site.source)

      cartographies.each do |cartography|
        next unless cartography["publicar"] != false

        id = cartography["id"]
        next if id.nil? || id.to_s.empty?

        page = Jekyll::PageWithoutAFile.new(
          site,
          site.source,
          "rizoma/cartografia/#{id}",
          "index.html"
        )
        page.process("index.html")
        page.content = ""
        page.data.merge!(
          "layout" => "cartografia",
          "title" => "Cartografía · #{cartography['fecha']}",
          "seo_title" => "Cartografía · #{id} · KNDL 000",
          "description" => "Cartografía revisada del piloto B3.1.1: aceptadas, rechazadas y pendientes.",
          "body_class" => "reading-poemas reading-rizoma",
          "main_class" => "reading-main",
          "noindex" => true,
          "sitemap" => false,
          "permalink" => "/rizoma/cartografia/#{id}/",
          "cartografia" => build_data(site, trama, cartography)
        )
        site.pages << page
      end
    end

    private

    def load_trama(root)
      merged = { "frentes" => [], "inscripciones" => [] }
      Dir[File.join(root, "docs", "rizoma", "trama", "*.yml")].sort.each do |path|
        data = YAML.safe_load(
          File.read(path),
          permitted_classes: [Date, Time],
          aliases: true
        )
        next unless data.is_a?(Hash)

        merged["frentes"].concat(Array(data["frentes"]))
        merged["inscripciones"].concat(Array(data["inscripciones"]))
      end
      merged
    rescue Psych::SyntaxError => error
      fail!("trama inválida: #{error.message}")
    end

    def load_cartographies(root)
      Dir[File.join(root, "docs", "rizoma", "cartografias", "*.yml")].sort.filter_map do |path|
        data = YAML.safe_load(
          File.read(path),
          permitted_classes: [Date, Time],
          aliases: true
        )
        data if data.is_a?(Hash)
      end
    rescue Psych::SyntaxError => error
      fail!("cartografía inválida: #{error.message}")
    end

    def build_data(site, trama, cartography)
      {
        "id" => cartography["id"],
        "fecha" => cartography["fecha"],
        "autor" => cartography["autor"],
        "propuesta_por" => cartography["propuesta_por"],
        "decision" => cartography["decision"],
        "notas" => cartography["notas"],
        "frente" => resolve_front(trama, cartography.dig("alcance", "frente")),
        "composiciones" => resolve_compositions(site, Array(cartography.dig("alcance", "composiciones"))),
        "aceptadas" => Array(cartography["aceptadas"]).filter_map do |id|
          resolve_inscription(site, trama, id)
        end,
        "rechazadas" => Array(cartography["rechazadas"]),
        "pendientes" => Array(cartography["pendientes"]),
        "evidencia" => Array(cartography["evidencia"])
      }
    end

    def resolve_front(trama, id)
      front = Array(trama["frentes"]).find { |item| item["id"] == id }
      return nil unless front

      {
        "id" => front["id"],
        "nombre" => front["nombre_canonico"] || front["id"],
        "estado" => front["estado"],
        "estado_label" => state_label(front["estado"]),
        "formulaciones" => Array(front["formulaciones"]),
        "tensiones" => Array(front["tensiones"])
      }
    end

    def resolve_compositions(site, ids)
      compositions = site.data["composiciones"] || {}
      ids.filter_map do |id|
        composition = compositions.find do |key, value|
          value.is_a?(Hash) && (value["id"] || key.to_s) == id
        end
        next unless composition

        value = composition[1]
        doc = find_exploration(site, value["exploracion"])
        {
          "id" => id,
          "titulo" => (doc && doc.data["title"]) || id,
          "url" => doc&.url || "/"
        }
      end
    end

    def resolve_inscription(site, trama, id)
      inscription = Array(trama["inscripciones"]).find { |item| item["id"] == id }
      return nil unless inscription

      front = resolve_front(trama, inscription["frente"])
      {
        "id" => inscription["id"],
        "material" => material_for(site, inscription["material"]),
        "frente" => front,
        "interpretacion" => inscription["interpretacion"],
        "evidencia" => Array(inscription["evidencia"]),
        "estado" => inscription["estado"]
      }
    end

    def state_label(value)
      {
        "abierto" => "abierto",
        "en-tension" => "en tensión",
        "resuelto" => "resuelto",
        "latente" => "latente",
        "cortado" => "cortado",
        "derivado" => "derivado"
      }.fetch(value.to_s, value.to_s)
    end

    def find_exploration(site, path)
      return nil if path.nil? || path.to_s.empty?

      docs = site.collections["exploraciones"]&.docs || []
      normalized = path.to_s.sub(%r{\A/}, "")
      slug = File.basename(normalized, ".*")

      docs.find { |doc| doc.path.to_s.sub(%r{\A/}, "") == normalized } ||
        docs.find do |doc|
          doc.respond_to?(:relative_path) &&
            doc.relative_path.to_s.sub(%r{\A/}, "") == normalized
        end ||
        docs.find { |doc| doc.basename_without_ext == slug }
    end

    def material_for(site, url)
      return { "url" => url, "title" => "Rastros", "kind" => "Rastros" } if url == "/fragmentos/"

      mapping = [
        ["/poemas/", "poems", "Poema"],
        ["/codigo/", "codigos", "Código"],
        ["/dispositivos/", "dispositivos", "Dispositivo"],
        ["/vestigios/", "vestigios", "Vestigio"],
        ["/imaginario/", "images", "Imagen"],
        ["/melange-reports/", "melange_reports", "Melange"]
      ]

      match = mapping.find { |prefix, _collection, _kind| url.start_with?(prefix) }
      return { "url" => url, "title" => url, "kind" => "Material" } unless match

      _prefix, collection_key, kind = match
      collection = site.collections[collection_key]
      doc = collection&.docs&.find do |candidate|
        candidate.url.to_s.chomp("/") == url.to_s.chomp("/")
      end

      {
        "url" => url,
        "title" => (doc && doc.data["title"]) || url,
        "kind" => kind
      }
    end

    def fail!(message)
      raise Jekyll::Errors::FatalException, "Rizoma cartografía: #{message}"
    end
  end
end
