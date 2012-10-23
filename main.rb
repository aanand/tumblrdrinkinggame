require 'sinatra'
require 'haml'
require 'sass'
require 'json'
require 'net/http'
require './views/bourbon/lib/bourbon'

before do
  redirect "http://www.tumblrdrinkinggame.com#{request.path}" if request.host =~ /heroku/
end

get '/' do
  headers['Cache-Control'] = 'public; max-age=300'
  haml :index
end

get '/stylesheet.css' do
  headers['Content-Type'] = 'text/css; charset=utf-8'
  headers['Cache-Control'] = 'public; max-age=300'
  sass :stylesheet
end

