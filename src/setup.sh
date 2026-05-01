curl -sL https://aka.ms/DevTunnelCliInstall | bash
err=$?
if [ $err -ne 0 ]
then
    chmod +x src/devtunnel
    sudo cp src/devtunnel /usr/local/bin
fi
sudo apt install nodejs
npm install nodemon
devtunnel user login -g
devtunnel create pipe
devtunnel port create pipe --port-number 6080