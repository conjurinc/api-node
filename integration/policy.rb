policy "api-node-test-integration-1.4" do
  alice = nil
  
  user "admin" do
    owns do
      alice = user "alice"

      group "everyone" do
        add_member alice
      end
    end
  end
  
  api.add_public_key alice.login, File.read(File.expand_path("id_rsa.pub", File.dirname(__FILE__)))
end
