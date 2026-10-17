require 'webrick'

class WEBrick::HTTPServlet::FileHandler
  def check_filename(req, res, name)
    # Allow workspace path with trailing whitespace
  end
end

server = WEBrick::HTTPServer.new(
  Port: 8080,
  DocumentRoot: Dir.pwd
)

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

server.start
