require "yaml"

module KNDL
  # Resuelve la capa de presentación de una exploración: mapa de lectura,
  # respiros y diagrama de tensión. Es genérica: no conoce slugs concretos.
  # Si no hay sidecar en _data/presentaciones/<slug>.yml, deriva el mapa de
  # los encabezados y deja el aparato cerrado.
  class RizomaPresentacionGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      presentaciones = site.data["presentaciones"] || {}
      docs = site.collections["exploraciones"]&.docs || []
      return if docs.empty?

      docs.each do |doc|
        slug = doc.basename_without_ext
        config = presentaciones[slug]
        config = {} unless config.is_a?(Hash)
        doc.data["presentacion"] = build(site, doc, config)
      end

      presentaciones.each_key do |slug|
        next if docs.any? { |doc| doc.basename_without_ext == slug }

        Jekyll.logger.warn "Rizoma presentación:", "sidecar sin exploración: #{slug}"
      end
    end

    private

    def build(site, doc, config)
      sections = section_map(doc.content)
      mapa = build_map(sections, config["mapa"])
      respiros = build_respiros(site, doc, config["respiros"], sections)
      diagrama = build_diagrama(site, doc, config["diagrama"], sections)

      {
        "mapa" => mapa,
        "respiros" => respiros,
        "diagrama" => diagrama,
        "aparato_abierto" => config["aparato"].to_s == "abierto"
      }
    end

    def section_map(content)
      sections = []
      intro = content.split(/^##\s+/, 2).first.to_s.strip
      sections << { "id" => "introduccion", "titulo" => "Introducción" } unless intro.empty?

      in_fence = false
      content.each_line do |line|
        if line.start_with?("```")
          in_fence = !in_fence
          next
        end
        next if in_fence

        if line =~ /^##\s+(.+?)\s*\{#([^}]+)\}\s*$/
          title = Regexp.last_match(1).strip
          id = Regexp.last_match(2).strip
        elsif line =~ /^##\s+(.+?)\s*$/
          title = Regexp.last_match(1).strip
          id = Jekyll::Utils.slugify(title)
        else
          next
        end

        sections << { "id" => id, "titulo" => title }
      end

      sections
    end

    def build_map(sections, config)
      by_id = sections.each_with_object({}) { |section, hash| hash[section["id"]] = section }

      if config.is_a?(Array) && !config.empty?
        config.map do |item|
          next unless item.is_a?(Hash)

          id = item["seccion"].to_s
          section = by_id[id]
          fail!("mapa: sección inexistente #{id}") unless section

          {
            "id" => id,
            "etiqueta" => item["etiqueta"] || display_title(section["titulo"]),
            "movimiento" => item["movimiento"]
          }
        end.compact
      else
        sections.map do |section|
          {
            "id" => section["id"],
            "etiqueta" => display_title(section["titulo"]),
            "movimiento" => nil
          }
        end
      end
    end

    def display_title(title)
      title.sub(/\A\d+[.)]\s*/, "")
    end

    def build_respiros(site, doc, config, sections)
      return {} unless config.is_a?(Array)

      ids = sections.map { |section| section["id"] }
      corpus = corpus_urls(doc)
      grouped = Hash.new { |hash, key| hash[key] = [] }

      config.each do |item|
        next unless item.is_a?(Hash)

        before = item["antes_de"].to_s
        text = item["texto"].to_s
        source = item["fuente"].to_s

        fail!("respiro sin antes_de") if before.empty?
        fail!("respiro: sección inexistente #{before}") unless ids.include?(before)
        fail!("respiro sin texto") if text.empty?
        fail!("respiro sin fuente") if source.empty?
        fail!("respiro: fuente fuera del corpus #{source}") unless corpus.include?(source)

        material = material_for(site, source)
        grouped[before] << {
          "texto" => text,
          "fuente" => source,
          "fuente_titulo" => material["title"]
        }
      end

      grouped
    end

    def build_diagrama(site, doc, config, sections)
      return nil unless config.is_a?(Hash)

      type = (config["tipo"] || "regimenes").to_s
      fail!("diagrama: tipo no soportado #{type}") unless type == "regimenes"

      corpus = corpus_urls(doc)
      left = build_side(site, corpus, config["izquierda"], "izquierda")
      right = build_side(site, corpus, config["derecha"], "derecha")
      before = config["antes_de"].to_s

      if !before.empty? && sections.none? { |section| section["id"] == before }
        fail!("diagrama: sección inexistente #{before}")
      end

      {
        "tipo" => type,
        "titulo" => config["titulo"].to_s,
        "antes_de" => before.empty? ? nil : before,
        "izquierda" => left,
        "derecha" => right,
        "corte" => config["corte"].to_s,
        "blanco" => config["blanco"].to_s
      }
    end

    def build_side(site, corpus, side, label)
      fail!("diagrama: falta #{label}") unless side.is_a?(Hash)

      obras = Array(side["obras"]).map do |url|
        fail!("diagrama: obra fuera del corpus #{url}") unless corpus.include?(url)

        material_for(site, url)
      end
      fail!("diagrama: #{label} sin obras") if obras.empty?

      {
        "etiqueta" => side["etiqueta"].to_s,
        "nota" => side["nota"].to_s,
        "obras" => obras
      }
    end

    def corpus_urls(doc)
      Array(doc.data["corpus"]).map do |item|
        item.is_a?(Hash) ? item["url"] : item
      end.compact
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
      raise Jekyll::Errors::FatalException, "Rizoma presentación: #{message}"
    end
  end
end
