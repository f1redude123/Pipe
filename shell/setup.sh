chmod +x shell/devtunnel
sudo cp shell/devtunnel /usr/local/bin
sudo apt install nodejs
npx npm install express
npx npm install path
npx npm install nodemon
devtunnel user login -g
devtunnel create pipe
devtunnel port create pipe --port-number 6080