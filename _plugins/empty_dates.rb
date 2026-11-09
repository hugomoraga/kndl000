# El CMS puede guardar `date: ""` cuando se limpia el campo de fecha.
# Jekyll intenta parsear ese valor vacío en Document#merge_date! y aborta el
# build con "no time information in \"\"". Tratamos una fecha vacía como
# ausente antes de que Jekyll la lea.
module Jekyll
  class Document
    alias_method :merge_date_without_empty!, :merge_date!

    def merge_date!(source)
      if data.key?("date") && data["date"].to_s.strip.empty?
        data.delete("date")
      end
      merge_date_without_empty!(source)
    end
  end
end
