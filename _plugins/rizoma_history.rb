require "open3"
require "date"
require "yaml"

module KNDL
  class RizomaHistoryPage < Jekyll::PageWithoutAFile
    def initialize(site, exploracion, history, current)
      @site = site
      @base = site.source
      @dir = exploracion.url.sub(%r{^/}, "").sub(%r{/$}, "") + "/historial"
      @name = "index.html"
      process(@name)

      self.data = {
        "layout" => "rizoma-historial",
        "title" => "Historial de evolución",
        "body_class" => "reading-poemas reading-rizoma",
        "main_class" => "reading-main",
        "exploracion_title" => exploracion.data["title"],
        "exploracion_url" => exploracion.url,
        "exploracion_question" => exploracion.data["question"],
        "current" => current,
        "history" => history,
        "hitos" => exploracion.data["hitos"] || []
      }
    end
  end

  class RizomaHistoryGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      @site = site
      @repo = (site.config["repository"] || "hugomoraga/kndl000").to_s
      docs = site.collections["exploraciones"]&.docs || []

      docs.each do |doc|
        next if doc.data["published"] == false
        history = build_history(doc.path)
        current = current_version(doc)
        site.pages << RizomaHistoryPage.new(site, doc, history, current)
      end
    end

    private

    def git(*args)
      out, status = Open3.capture2("git", *args, chdir: @site.source)
      [out, status.success?]
    end

    def build_history(path)
      out, ok = git("log", "--follow", "--format=@@%H%x1f%aI%x1f%s", "--name-only", "--", path)
      return [] unless ok

      versions = []
      out.split("@@").reject(&:empty?).each do |block|
        lines = block.split("\n").reject(&:empty?)
        header = lines.shift
        next unless header

        sha, date, message = header.split("\x1f", 3)
        file_path = lines.first&.strip
        next unless sha && file_path

        content, shown = git("show", "#{sha}:#{file_path}")
        next unless shown

        data = parse_frontmatter(content)
        versions << {
          "sha" => sha,
          "short" => sha[0, 7],
          "date" => date,
          "message" => message,
          "title" => data["title"],
          "question" => data["question"],
          "summary" => data["summary"],
          "status" => data["status"],
          "nodos" => data["nodos"] || data["concepts"] || [],
          "corpus" => data["corpus"] || [],
          "relacionadas" => data["relacionadas"] || [],
          "url_commit" => "https://github.com/#{@repo}/commit/#{sha}",
          "url_file" => "https://github.com/#{@repo}/blob/#{sha}/#{file_path}",
          "url_raw" => "https://raw.githubusercontent.com/#{@repo}/#{sha}/#{file_path}"
        }
      end

      versions.each_with_index do |version, index|
        older = versions[index + 1]
        version["changes"] = []

        if older
          version["url_compare"] = "https://github.com/#{@repo}/compare/#{older['sha']}...#{version['sha']}"
          version["changes"] << "Título modificado" if older["title"].to_s != version["title"].to_s
          version["changes"] << "Pregunta inicial modificada" if older["question"].to_s != version["question"].to_s
          version["changes"] << "Resumen modificado" if older["summary"].to_s != version["summary"].to_s
          version["changes"] << "Estado: #{older['status']} → #{version['status']}" if older["status"].to_s != version["status"].to_s

          added_nodos = version["nodos"] - older["nodos"]
          removed_nodos = older["nodos"] - version["nodos"]
          version["changes"] << "Nodos añadidos: #{added_nodos.join(' · ')}" unless added_nodos.empty?
          version["changes"] << "Nodos retirados: #{removed_nodos.join(' · ')}" unless removed_nodos.empty?

          current_corpus = corpus_urls(version["corpus"])
          older_corpus = corpus_urls(older["corpus"])
          added_corpus = current_corpus - older_corpus
          removed_corpus = older_corpus - current_corpus
          version["changes"] << "Corpus añadido: #{added_corpus.size}" unless added_corpus.empty?
          version["changes"] << "Corpus retirado: #{removed_corpus.size}" unless removed_corpus.empty?

          added_relations = version["relacionadas"] - older["relacionadas"]
          removed_relations = older["relacionadas"] - version["relacionadas"]
          version["changes"] << "Relaciones añadidas: #{added_relations.size}" unless added_relations.empty?
          version["changes"] << "Relaciones retiradas: #{removed_relations.size}" unless removed_relations.empty?
        else
          version["changes"] << "Primera versión registrada"
        end
      end

      versions
    end

    def corpus_urls(corpus)
      Array(corpus).map { |item| item.is_a?(Hash) ? item["url"] : item }.compact
    end

    def current_version(doc)
      {
        "title" => doc.data["title"],
        "question" => doc.data["question"],
        "summary" => doc.data["summary"],
        "status" => doc.data["status"],
        "nodos" => doc.data["nodos"] || [],
        "corpus" => doc.data["corpus"] || [],
        "relacionadas" => doc.data["relacionadas"] || [],
        "updated" => doc.data["updated"]
      }
    end

    def parse_frontmatter(content)
      parts = content.split(/^---\s*$/, 3)
      return {} if parts.length < 2

      YAML.safe_load(parts[1], permitted_classes: [Date, Time], aliases: true) || {}
    rescue StandardError
      {}
    end
  end
end
