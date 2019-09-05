require 'sinatra'
require 'sinatra/contrib'
require "sinatra/reloader" if development?
require "net/http"
require "uri"
require "json"

# Making this an API for the app and the rest of the world.
# before do
#    headers 'Access-Control-Allow-Origin' => '*',
#            'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST']
# end

get '/' do
   send_file './public/index.html'
end

set :public_folder, './public'
