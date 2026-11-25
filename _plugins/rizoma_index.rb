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
      generate_redirects(site, root, index)
    rescue StandardError => error
      Jekyll.logger.warn "Rizoma:", "no se pudo leer #{root}: #{error.message}"
      site.data["rizoma_index"] = empty_index
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

    def frontmatter(path)
      content = File.read(path, encoding: "UTF-8")
      parts = content.split(/^---\s*$/, 3)
      return {} if parts.length < 2

      YAML.safe_load(parts[1], permitted_classes: [Date, Time], aliases: true) || {}
    rescue Psych::SyntaxError => error
      Jekyll.logger.warn "Rizoma:", "frontmatter inválido en #{path}: #{error.message}"
      {}
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
