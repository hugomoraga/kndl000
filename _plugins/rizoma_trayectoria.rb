require "yaml"
require "date"

module KNDL
  # Resuelve la trama del piloto B3.1.1 y la adjunta a cada exploración
  # como page.trayectoria. La trama vive fuera de Jekyll; la composición
  # selecciona qué parte se muestra.
  class RizomaTrayectoriaGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      compositions = site.data["composiciones"] || {}
      return if compositions.empty?

      trama = load_trama(site.source)
      return if trama["frentes"].empty? && trama["inscripciones"].empty?

      entries = build_entries(site, compositions)
      appearances = build_appearances(entries)

      entries.each do |entry|
        entry["doc"].data["trayectoria"] = build_trayectoria(
          site,
          trama,
          entry["data"],
          entry["id"],
          appearances
        )
      end
    end

    private

    def load_trama(root)
      merged = { "frentes" => [], "inscripciones" => [] }
      files = Dir[File.join(root, "docs", "rizoma", "trama", "*.yml")].sort

      files.each do |path|
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

    def build_entries(site, compositions)
      entries = []

      compositions.each do |key, composition|
        next unless composition.is_a?(Hash)

        id = composition["id"] || key.to_s
        doc = find_exploration(site, composition["exploracion"])
        fail!("composición #{id} sin exploración resoluble: #{composition['exploracion']}") unless doc

        entries << { "id" => id, "data" => composition, "doc" => doc }
      end

      entries
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

    def build_appearances(entries)
      appearances = Hash.new { |hash, key| hash[key] = [] }

      entries.each do |entry|
        composition = entry["data"]
        Array(composition["inscripciones"]).each do |selection|
          next unless selection.is_a?(Hash)

          id = selection["id"]
          next if id.nil? || id.to_s.empty?

          appearances[id] << {
            "id" => entry["id"],
            "titulo" => entry["doc"].data["title"] || entry["id"],
            "url" => entry["doc"].url,
            "ancla" => selection["ancla"]
          }
        end
      end

      appearances
    end

    def build_trayectoria(site, trama, composition, composition_id, appearances)
      frentes = []

      Array(composition["frentes"]).each do |front_selection|
        front = find_by_id(trama["frentes"], front_selection["id"])
        fail!("frente inexistente: #{front_selection['id']}") unless front

        inscriptions = Array(composition["inscripciones"]).filter_map do |selection|
          inscription = find_by_id(trama["inscripciones"], selection["id"])
          fail!("inscripción inexistente: #{selection['id']}") unless inscription

          if inscription["frente"] != front["id"]
            fail!(
              "la inscripción #{inscription['id']} pertenece a #{inscription['frente']}, " \
              "no al frente #{front['id']}"
            )
          end

          build_inscription(site, inscription, selection, composition_id, appearances)
        end

        frentes << {
          "id" => front["id"],
          "nombre_canonico" => front["nombre_canonico"] || front["id"],
          "etiqueta" => front_selection["etiqueta"] || front["nombre_canonico"] || front["id"],
          "ancla" => front_selection["ancla"],
          "orden" => front_selection["orden"].to_i,
          "estado" => front["estado"],
          "estado_label" => state_label(front["estado"]),
          "formulaciones" => Array(front["formulaciones"]),
          "tensiones" => Array(front["tensiones"]),
          "inscripciones" => inscriptions.sort_by { |inscription| inscription["orden"] }
        }
      end

      {
        "piloto" => true,
        "frentes" => frentes.sort_by { |front| front["orden"] }
      }
    end

    def build_inscription(site, inscription, selection, composition_id, appearances)
      unless inscription["material"].is_a?(String) && !inscription["material"].empty?
        fail!("la inscripción #{inscription['id']} no tiene material")
      end
      unless inscription["frente"].is_a?(String) && !inscription["frente"].empty?
        fail!("la inscripción #{inscription['id']} no tiene frente")
      end
      unless inscription["interpretacion"].is_a?(Hash) && inscription["interpretacion"]["principal"]
        fail!("la inscripción #{inscription['id']} no tiene interpretación principal")
      end
      unless inscription["evidencia"].is_a?(Array) && !inscription["evidencia"].empty?
        fail!("la inscripción #{inscription['id']} no tiene evidencia")
      end

      {
        "id" => inscription["id"],
        "material" => material_for(site, inscription["material"]),
        "interpretacion" => inscription["interpretacion"],
        "evidencia" => inscription["evidencia"],
        "estado" => inscription["estado"],
        "propuesta_por" => inscription["propuesta_por"],
        "validado_por" => inscription["validado_por"],
        "etiqueta" => selection["etiqueta"],
        "ancla" => selection["ancla"],
        "orden" => selection["orden"].to_i,
        "otras_composiciones" => (appearances[inscription["id"]] || []).reject do |appearance|
          appearance["id"] == composition_id
        end
      }
    end

    def material_for(site, url)
      if url == "/fragmentos/"
        return {
          "url" => url,
          "title" => "Rastros",
          "kind" => "Rastros",
          "sigil" => "rastros"
        }
      end

      mapping = [
        ["/poemas/", "poems", "Poema", "poemas"],
        ["/codigo/", "codigos", "Código", "codigo"],
        ["/dispositivos/", "dispositivos", "Dispositivo", "dispositivos"],
        ["/vestigios/", "vestigios", "Vestigio", "vestigios"],
        ["/imaginario/", "images", "Imagen", "imaginario"],
        ["/melange-reports/", "melange_reports", "Melange", "melange-reports"]
      ]

      match = mapping.find { |prefix, _collection, _kind, _sigil| url.start_with?(prefix) }
      unless match
        return { "url" => url, "title" => url, "kind" => "Material", "sigil" => nil }
      end

      _prefix, collection_key, kind, sigil = match
      collection = site.collections[collection_key]
      doc = collection&.docs&.find do |candidate|
        candidate.url.to_s.chomp("/") == url.to_s.chomp("/")
      end

      {
        "url" => url,
        "title" => (doc && doc.data["title"]) || url,
        "kind" => kind,
        "sigil" => sigil
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

    def find_by_id(collection, id)
      Array(collection).find { |item| item.is_a?(Hash) && item["id"] == id }
    end

    def fail!(message)
      raise Jekyll::Errors::FatalException, "Rizoma trayectoria: #{message}"
    end
  end
end
