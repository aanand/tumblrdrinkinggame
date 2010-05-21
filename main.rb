require 'sinatra'
require 'haml'
require 'json'
require 'net/http'

get '/' do
  haml :index
end

post '/' do
  noun     = params[:noun]
  domain   = "fuckyeah#{noun}.tumblr.com"
  response = Net::HTTP.start(domain) { |http| http.head('/') }

  {
    :noun   => noun,
    :domain => domain,
    :exists => (response.code.to_i == 200)
  }.to_json
end

get '/stylesheet.css' do
  headers['Content-Type'] = 'text/css; charset=utf-8'
  sass :stylesheet
end

