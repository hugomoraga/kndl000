# Genera una página de índice por cada serie de poemas publicada.
# La página vive en /poemas/series/:slug/ y recibe las partes ya ordenadas.
module KNDL
  class SeriesPage < Jekyll::PageWithoutAFile
    def initialize(site, series_name, slug, poems)
      @site = site
      @base = site.source
      @dir = File.join("poemas", "series", slug)
      @name = "index.html"
      process(@name)

      self.data = {
        "layout" => "serie",
        "title" => series_name,
        "symbol" => "⁂",
        "sigil" => "poemas",
        "body_class" => "reading-poemas reading-serie",
        "main_class" => "reading-main",
        "description" => "Serie #{series_name} — #{poems.size} poemas.",
        "series_name" => series_name,
        "series_slug" => slug,
        "series_count" => poems.size,
        "series_poems" => poems
      }
    end
  end

  class SeriesGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      docs = site.collections["poems"]&.docs || []
      published = docs.select { |doc| doc.data["published"] != false }

      groups = published.group_by { |doc| doc.data["series"].to_s.strip }
      groups.each do |name, items|
        next if name.empty? || items.size < 2

        slug = Jekyll::Utils.slugify(name)
        sorted = items.sort_by { |doc| part_key(doc) }
        poems = sorted.map { |doc| poem_data(doc) }
        site.pages << SeriesPage.new(site, name, slug, poems)
      end
    end

    private

    def part_key(doc)
      part = doc.data["part"].to_s.strip
      number = part.empty? ? 999 : part.to_i
      [number, doc.date || Time.at(0)]
    end

    def poem_data(doc)
      {
        "title" => doc.data["title"],
        "url" => doc.url,
        "part" => doc.data["part"].to_s,
        "date" => doc.date ? doc.date.strftime("%Y-%m-%d") : ""
      }
    end
  end
end
