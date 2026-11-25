require "yaml"
require "date"
require "set"

module KNDL
  # Lee el repo de Rizoma en build time y expone site.data["rizoma_index"].
  # No construye ni copia el sitio de Rizoma: kndl solo muestra un índice y
  # enlaza a rizoma.quicio.org. También genera redirects para las URLs viejas
  # del embed (/rizoma/<slug>/, anexos, historial, trayectoria, nodos).
  class RizomaIndexGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      root = rizoma_root(site)
      index = build_index(root)
      site.data["rizoma_index"] = index
      site.data["rizoma_apariciones"] = build_appearances(root, index)
      generate_redirects(site, root, index)
    rescue StandardError => error
      Jekyll.logger.warn "Rizoma:", "no se pudo leer #{root}: #{error.message}"
      site.data["rizoma_index"] = empty_index
      site.data["rizoma_apariciones"] = {}
    end

    private

    def rizoma_root(site)
      ENV["RIZOMA_DIR"] || File.expand_path("../rizoma", site.source)
    end

    def rizoma_url
      (ENV["RIZOMA_SITE_URL"] || "https://rizoma.quicio.org").sub(%r{/\z}, "")
    end

    def empty_index
      {
        "site" => rizoma_url,
        "nodos" => 0,
        "exploraciones" => [],
        "ultimas" => []
      }
    end

    def build_index(root)
      unless Dir.exist?(root)
        Jekyll.logger.warn "Rizoma:", "no encontrado en #{root}"
        return empty_index
      end

      explorations = Dir[File.join(root, "src", "content", "exploraciones", "*.md")].sort.filter_map do |path|
        fm = frontmatter(path)
        next if fm["published"] == false

        slug = File.basename(path, ".md")
        {
          "slug" => slug,
          "order" => fm["order"].to_s,
          "title" => fm["title"].to_s,
          "question" => fm["question"].to_s,
          "summary" => fm["summary"].to_s,
          "status" => fm["status"].to_s,
          "updated" => date_string(fm["updated"] || fm["date"]),
          "nodos" => Array(fm["nodos"]).size,
          "corpus" => Array(fm["corpus"]).size,
          "url" => "#{rizoma_url}/#{slug}/"
        }
      end

      explorations.sort_by! { |item| [item["order"].to_i, item["title"]] }
      ultimas = explorations
        .sort_by { |item| [item["updated"].to_s, item["order"].to_i] }
        .reverse
      nodos = Dir[File.join(root, "src", "content", "nodos", "*.md")].size

      {
        "site" => rizoma_url,
        "nodos" => nodos,
        "exploraciones" => explorations,
        "ultimas" => ultimas
      }
    end

    def build_appearances(root, index)
      appearances = Hash.new { |hash, key| hash[key] = [] }
      by_slug = index["exploraciones"].each_with_object({}) do |item, hash|
        hash[item["slug"]] = item
      end
      seen = Set.new

      Dir[File.join(root, "src", "content", "exploraciones", "*.md")].sort.each do |path|
        fm, body = read_document(path)
        next if fm["published"] == false

        slug = File.basename(path, ".md")
        exploration = by_slug[slug]
        next unless exploration

        sections = section_map(body)
        notes = corpus_notes(fm)
        sectioned = Set.new

        Array(fm["corpus_secciones"]).each do |group|
          next unless group.is_a?(Hash)

          section = sections[group["seccion"].to_s]
          Array(group["piezas"]).each do |piece|
            work = normalize_work_url(piece.is_a?(Hash) ? piece["url"] : piece)
            next unless work

            sectioned << work
            add_appearance(appearances, seen, work, exploration, section, notes[work], "exploracion")
          end
        end

        Array(fm["corpus"]).each do |item|
          work = normalize_work_url(item.is_a?(Hash) ? item["url"] : item)
          next unless work
          next if sectioned.include?(work)

          add_appearance(appearances, seen, work, exploration, nil, notes[work], "exploracion")
        end
      end

      Dir[File.join(root, "src", "content", "anexos", "*", "*.md")].sort.each do |path|
        next if File.basename(path, ".md") == "index"

        fm, = read_document(path)
        exp_slug = File.basename(File.dirname(path))
        exploration = by_slug[exp_slug]
        next unless exploration

        anexo_slug = File.basename(path, ".md")
        anexo_url = "#{rizoma_url}/#{exp_slug}/anexos/#{anexo_slug}/"

        Array(fm["fuentes"]).each do |source|
          next unless source.is_a?(Hash)

          work = normalize_work_url(source["url"])
          next unless work

          add_appearance(
            appearances,
            seen,
            work,
            exploration,
            nil,
            source["titulo"].to_s,
            "anexo",
            label: fm["title"].to_s,
            url: anexo_url
          )
        end
      end

      appearances.each_value do |list|
        list.sort_by! do |item|
          [item["order"], item["kind_order"], item["section_order"], item["label"].to_s]
        end
      end
      appearances
    end

    def add_appearance(map, seen, work, exploration, section, note, kind, label: nil, url: nil)
      key = [work, exploration["url"], kind, section ? section["id"] : nil, label]
      return if seen.include?(key)

      seen << key
      map[work] << {
        "kind" => kind,
        "kind_order" => kind == "anexo" ? 1 : 0,
        "label" => label || exploration["title"],
        "exploration" => exploration["title"],
        "exploration_url" => exploration["url"],
        "section" => section ? section["label"] : nil,
        "section_number" => section ? section["number"] : nil,
        "url" => url || (section ? "#{exploration["url"]}#{section["anchor"]}" : exploration["url"]),
        "note" => note.to_s,
        "order" => exploration["order"].to_i,
        "section_order" => section ? section["order"].to_i : 0
      }
    end

    def section_map(body)
      sections = {}
      in_fence = false

      body.each_line do |line|
        if line.start_with?("```")
          in_fence = !in_fence
          next
        end
        next if in_fence

        match = line.match(/^##\s+(.+?)\s*\{#([^}]+)\}\s*$/)
        if match
          title = match[1].strip
          id = match[2].strip
        else
          match = line.match(/^##\s+(.+?)\s*$/)
          next unless match

          title = match[1].strip
          id = Jekyll::Utils.slugify(title)
        end

        number = title[/\A(\d+)[.)]\s*/, 1]
        sections[id] = {
          "id" => id,
          "title" => title,
          "label" => title.sub(/\A\d+[.)]\s*/, ""),
          "number" => number,
          "anchor" => "##{id}",
          "order" => number.to_i
        }
      end

      sections
    end

    def corpus_notes(fm)
      Array(fm["corpus"]).each_with_object({}) do |item, notes|
        next unless item.is_a?(Hash)

        work = normalize_work_url(item["url"])
        next unless work

        note = item["note"].to_s.strip
        notes[work] = note unless note.empty?
      end
    end

    def normalize_work_url(value)
      raw = value.to_s.strip
      return nil if raw.empty?
      return nil if raw.start_with?("//")

      raw = raw.sub(%r{\Ahttps?://kndl\.quicio\.(?:org|qzz\.io)}, "")
      return nil unless raw.start_with?("/")
      return nil if raw.start_with?("/rizoma/")

      raw = raw.split(/[?#]/).first.to_s
      raw = "/#{raw}" unless raw.start_with?("/")
      raw.end_with?("/") ? raw : "#{raw}/"
    end

    def frontmatter(path)
      read_document(path).first
    end

    def read_document(path)
      content = File.read(path, encoding: "UTF-8")
      parts = content.split(/^---\s*$/, 3)
      return [{}, content] if parts.length < 2

      meta = YAML.safe_load(parts[1], permitted_classes: [Date, Time], aliases: true) || {}
      [meta, parts[2] || ""]
    rescue Psych::SyntaxError => error
      Jekyll.logger.warn "Rizoma:", "frontmatter inválido en #{path}: #{error.message}"
      [{}, ""]
    end

    def date_string(value)
      return "" if value.nil?

      case value
      when Date, Time, DateTime
        value.strftime("%Y-%m-%d")
      else
        value.to_s
      end
    end

    def generate_redirects(site, root, index)
      return unless Dir.exist?(root)

      seen = Set.new

      index["exploraciones"].each do |exploration|
        slug = exploration["slug"]
        add_redirect(site, seen, "rizoma/#{slug}", "#{rizoma_url}/#{slug}/")
        add_redirect(site, seen, "rizoma/#{slug}/historial", "#{rizoma_url}/#{slug}/historial/")
        add_redirect(site, seen, "rizoma/#{slug}/anexos", "#{rizoma_url}/#{slug}/anexos/")

        Dir[File.join(root, "src", "content", "anexos", slug, "*.md")].sort.each do |path|
          anexo = File.basename(path, ".md")
          next if anexo == "index"

          add_redirect(
            site,
            seen,
            "rizoma/#{slug}/anexos/#{anexo}",
            "#{rizoma_url}/#{slug}/anexos/#{anexo}/"
          )
        end
      end

      add_redirect(site, seen, "rizoma/nodos", "#{rizoma_url}/nodos/")

      Dir[File.join(root, "src", "data", "cartografias", "*.yml")].sort.each do |path|
        data = YAML.safe_load(File.read(path), permitted_classes: [Date, Time], aliases: true) || {}
        next if data["publicar"] == false

        id = data["id"].to_s
        next if id.empty?

        add_redirect(site, seen, "rizoma/trayectoria/#{id}", "#{rizoma_url}/trayectoria/#{id}/")
      end
    end

    def add_redirect(site, seen, dir, target)
      dir = dir.sub(%r{\A/}, "").sub(%r{/\z}, "")
      return if seen.include?(dir)

      seen << dir
      page = Jekyll::PageWithoutAFile.new(site, site.source, dir, "index.html")
      page.data.merge!(
        "layout" => "rizoma-redirect",
        "redirect_to" => target,
        "sitemap" => false,
        "noindex" => true
      )
      page.content = ""
      site.pages << page
    end
  end
end
