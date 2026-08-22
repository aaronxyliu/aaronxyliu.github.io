#!/usr/bin/env ruby

# Select Chirpy's interface language independently for every post.
# An explicit `lang` value in front matter takes priority. Existing posts can
# continue to use the `lang-zh` and `lang-en` tags as their source of truth.
POST_LANGUAGES = {
  'lang-zh' => 'zh-CN',
  'lang-en' => 'en'
}.freeze

Jekyll::Hooks.register :posts, :pre_render do |post|
  next if post.data['lang']

  tags = Array(post.data['tags'])
  matched_languages = POST_LANGUAGES.select { |tag, _lang| tags.include?(tag) }

  if matched_languages.length > 1
    Jekyll.logger.warn 'Post language:', "#{post.relative_path} contains conflicting language tags"
    next
  end

  post.data['lang'] = matched_languages.values.first if matched_languages.length == 1
end
