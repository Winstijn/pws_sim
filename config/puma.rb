# if (/darwin/ =~ RUBY_PLATFORM) == nil
#  bind "unix:///var/run/sockets/pws_sim.sock"
#  daemonize true
# else
#  port ENV.fetch("PORT") { 3000 }
# end
environment "development"
pidfile 'tmp/pids/server.pid'
