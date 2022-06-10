const web3 =  require('@solana/web3.js');
const metadata = require('@metaplex-foundation/mpl-token-metadata');
const axios = require('axios');
const { createWriteStream, readdir, readFileSync, access, mkdirSync, existsSync, readdirSync, writeFileSync } = require('fs');
const GIFEncoder = require('gif-encoder-2');
const { promisify } = require('util');
const path = require('path');
const extractFrames = require('gif-extract-frames');
const basePath = process.cwd();
const readdirAsync = promisify(readdir);
var gifFrames = require('gif-frames');
var fs = require('fs');
const frameCount = 5;
const collectionCount = 0;
const delay = ms => new Promise(res => setTimeout(res, ms));
const {
  format
} = require(`${basePath}/config.js`);
const { createCanvas, loadImage, Image  } = require(`${basePath}/node_modules/canvas`);

(async () => {
    //const connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
    //Enter users wallet id
    //const walletId = '683RcSmjXnKHeiDNxYnAuD1C8fw4avetS9Xw13fwRn98';
    //const pubkey = new web3.PublicKey(walletId);
    //Enter rover ids from left to right
    //const roverArray = ['1743','3128','3689']
    //Enter final name to save combination as
    //const finalArmadaPNGName = 'Armada #142';
    
    //Name of background used in background folder
    //const backgroundForArmadaPNGName = 'BirdsBackground';

    const canvas = createCanvas(format.width, format.height);
    const ctx = canvas.getContext("2d");

    //getMetaDataForEachRoverNoValidation();
    await generateUltron();
    // metadata.Metadata.getPDA(connection,{mint: walletId}).then((resp) =>{
    //         console.log(JSON.stringify(resp));
    //         // let orderedMetaDataArray = []
    //         // let filteredResp1 = resp.filter((metaData) => {
    //         //   return metaData.data.name === 'Rover #'+ roverArray[0]
    //         // })[0];
    //         // let filteredResp2 = resp.filter((metaData) => {
    //         //   return metaData.data.name === 'Rover #'+ roverArray[1]
    //         // })[0];
    //         // let filteredResp3 = resp.filter((metaData) => {
    //         //   return metaData.data.name === 'Rover #'+ roverArray[2]
    //         // })[0];
    //         // orderedMetaDataArray.unshift(filteredResp1);
    //         // orderedMetaDataArray.unshift(filteredResp2);
    //         // orderedMetaDataArray.unshift(filteredResp3);
    //         // return await getMetaDataForEachRover(orderedMetaDataArray)
    // });

    //let walletPubkey = new web3.PublicKey("7BiSQw3szSfQv4RcCnJmwV3fZo8LctSJ6hR8DTdaUo3F");
    //let programId = new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

    // connection.getParsedAccountInfo(programId).then((resp) => {
    //   console.log(JSON.stringify(resp.value.owner));
    // });

    async function getMetaDataForEachRover(filteredResp) {
        // let promiseList = [];
        // filteredResp.forEach(nft => {
        //     promiseList.unshift(axios.get(nft.data.uri));
        // });
        
        // const bar = await Promise.all(promiseList);
        let arrayOfRoverTraits = [];
        bar.forEach((item) => {
          console.log( item.data.name + ":" + item.data.image);
          arrayOfRoverTraits.push(item.data.attributes);
        })
        
        let stringOfPathsInOrder = []
        let x = 0;
        //stringOfPathsInOrder.push(`${basePath}\\layers\\Background\\${backgroundForArmadaPNGName}.png`);
        arrayOfRoverTraits.forEach((rover) => {

          let direction = x == 0 ? "left" : x == 1 ? "center" : "right";
          for (let i = 0; i < rover.length; i++) {
            if(rover[i].trait_type !== "Background" && rover[i].value != 'None'){
              let fileName = fs.readdirSync(`${basePath}\\layers\\${rover[i].trait_type.replace(" ", "_")}\\${direction}\\${rover[i].value.replace(" ", "_")}`)[0];
              stringOfPathsInOrder.push(`${basePath}\\layers\\${rover[i].trait_type.replace(" ", "_")}\\${direction}\\${rover[i].value.replace(" ", "_")}\\${fileName}`);
            }
          }
          x++;
        })

        for (let i = 0; i < stringOfPathsInOrder.length; i++) {
          loadImage(stringOfPathsInOrder[i]).then(image => {
            ctx.drawImage(image, 0, 0, format.width, format.height)
            const buffer = canvas.toBuffer('image/png')
            fs.writeFileSync(`./ArmadasNoOrder/${finalArmadaPNGName}.png`, buffer)
          })
        }
        
        return bar;
    }

    async function getMetaDataForEachRoverNoValidation() {

      //no wallet validation, now using the metadata directly from arweave
      let orderedMetaDataArray = []
      let rawdata = readFileSync(`${basePath}\\arweave-metadata\\arweave-metadata.json`);
      let filteredRover0 = JSON.parse(rawdata).filter(function (entry) {
            return entry.tokenData.name === 'Rover #'+ roverArray[0]
      })[0];
      let filteredRover1 = JSON.parse(rawdata).filter(function (entry) {
            return entry.tokenData.name === 'Rover #'+ roverArray[1]
      })[0];
      let filteredRover2 = JSON.parse(rawdata).filter(function (entry) {
          return entry.tokenData.name === 'Rover #'+ roverArray[2]
      })[0];

      orderedMetaDataArray.unshift(filteredRover0);
      orderedMetaDataArray.unshift(filteredRover1);
      orderedMetaDataArray.unshift(filteredRover2);

      let promiseList = [];
      orderedMetaDataArray.forEach(nft => {
        //console.log(nft.tokenData)
        promiseList.unshift(axios.get(nft.tokenData.uri));
      });
      
      const bar = await Promise.all(promiseList);

      let arrayOfRoverTraits = [];
      bar.forEach((item) => {
        console.log( item.data.name + " : " + item.data.image);
        arrayOfRoverTraits.push(item.data.attributes);
      })
      
      let stringOfPathsInOrder = []
      let x = 0;

      arrayOfRoverTraits.forEach((rover) => {

        let direction = x == 0 ? "left" : x == 1 ? "center" : "right";
        for (let i = 0; i < rover.length; i++) {
          if(rover[i].trait_type !== "Background" && rover[i].value != 'None'){
            let fileName = fs.readdirSync(`${basePath}\\layers\\${rover[i].trait_type.replace(" ", "_")}\\${direction}\\${rover[i].value.replace(" ", "_")}`)[0];
            stringOfPathsInOrder.push(`${basePath}\\layers\\${rover[i].trait_type.replace(" ", "_")}\\${direction}\\${rover[i].value.replace(" ", "_")}\\${fileName}`);
          }
        }
        x++;
      })

      for (let i = 0; i < stringOfPathsInOrder.length; i++) {
        loadImage(stringOfPathsInOrder[i]).then(image => {
          ctx.drawImage(image, 0, 0, format.width, format.height)
          const buffer = canvas.toBuffer('image/png')
          fs.writeFileSync(`./ArmadasNoOrder/${finalArmadaPNGName}.png`, buffer)
        })
      }
    }

    async function generateUltron() {

      for (let u = collectionCount; u < collectionCount + 1; u++) {
        console.log('start')
        let rawdataunparsed = readFileSync(`${basePath}\\ultron-apes-metadata\\${u}.json`);
     
        let rawDataParsed = JSON.parse(rawdataunparsed);
        let finalUltronGIFName = rawDataParsed.name.replace("#", "").replace(" ", "_").replace(" ", "_");

        let arrayOfUltronApeTraits = rawDataParsed.attributes;
        
        let stringOfPathsInOrder = [];
        arrayOfUltronApeTraits.forEach((apeTrait) => {
          if(apeTrait.value == "None" && apeTrait.trait_type == "Eyes"){
            let newWinkForNoEyes = arrayOfUltronApeTraits.find(x => x.trait_type == "Body").value;
            let traitFileName = newWinkForNoEyes.replace(" ", "_");
            let fileName = `${basePath}\\ultron-layers\\wink\\${traitFileName.toLowerCase()}_wink.gif`;
            stringOfPathsInOrder.push(fileName);
          }
          if(apeTrait.value !== "None"){
            let traitFileName = apeTrait.value.replace(" ", "_");
            let fileName = `${basePath}\\ultron-layers\\${apeTrait.trait_type.toLowerCase()}\\${traitFileName.toLowerCase()}.gif`;
            stringOfPathsInOrder.push(fileName);
          }
        });
        
        await extractFiles(stringOfPathsInOrder).then(async ()  => {
            console.log('after extract started');
              await delay(25);
              for (let i = 0; i < frameCount; i++) {
                if (!existsSync(`${basePath}\\ultron-layers-frames-combined\\${finalUltronGIFName}`)){
                  mkdirSync(`${basePath}\\ultron-layers-frames-combined\\${finalUltronGIFName}`);
                }
                for (let x = 0; x < stringOfPathsInOrder.length; x++) {
                  const pieces = stringOfPathsInOrder[x].split(/\\/);
                  const last = pieces[pieces.length - 1].split('.')[0];
                  const secondToLast = pieces[pieces.length - 2].split('.')[0];
                  console.log(`${basePath}\\ultron-layers-frames\\${secondToLast}\\${last}\\${last}-frame-${i}.png`);
                  loadImage(`${basePath}\\ultron-layers-frames\\${secondToLast}\\${last}\\${last}-frame-${i}.png`).then(image => {
                    ctx.drawImage(image, 0, 0, format.width, format.height)
                    const buffer = canvas.toBuffer('image/png');
                    writeFileSync(`${basePath}\\ultron-layers-frames-combined\\${finalUltronGIFName}\\frame-${i}-combined.png`, buffer)
                  })
                }
                ctx.clearRect(0, 0, format.width, format.height);
              }
        });
        createGif('neuquant', `${basePath}\\ultron-layers-frames-combined\\${finalUltronGIFName}`, finalUltronGIFName);
      }
}

  async function extractFiles(stringOfPathsInOrder){
    for (let i = 0; i < stringOfPathsInOrder.length; i++) {
      const pieces = stringOfPathsInOrder[i].split(/\\/);
      const last = pieces[pieces.length - 1].split('.')[0];
      const secondToLast = pieces[pieces.length - 2].split('.')[0];
      
      console.log('extract files start');
      
      if (!existsSync(`${basePath}\\ultron-layers-frames\\${secondToLast}`)){
          mkdirSync(`${basePath}\\ultron-layers-frames\\${secondToLast}`);
      }

      if (!existsSync(`${basePath}\\ultron-layers-frames\\${secondToLast}\\${last}`)){
        mkdirSync(`${basePath}\\ultron-layers-frames\\${secondToLast}\\${last}`);
      }

      if(secondToLast == 'background'){
        for (let i = 0; i < frameCount; i++) {
          await gifFrames(
            { url: stringOfPathsInOrder[0], frames: '0', outputType: 'png', cumulative: true },
            function (err, frameData) {
              if (err) {
                throw err;
              }
              frameData.forEach(async function (frame) {
                frame.getImage().pipe(createWriteStream(
                  `${basePath}\\ultron-layers-frames\\background\\${last}\\${last}-frame-${i}.png`
                ))
              });
            }
          );
        }
      } else{
        await gifFrames(
          { url: stringOfPathsInOrder[i], frames: '0-1', outputType: 'png', cumulative: true },
          function (err, frameData) {
            if (err) {
              throw err;
            }
            frameData.forEach(async function (frame) {
              frame.getImage().pipe(createWriteStream(
                `${basePath}\\ultron-layers-frames\\${secondToLast}\\${last}\\${last}-frame-${frame.frameIndex}.png`
              ))
            });
          }
        );
  
        await gifFrames(
          { url: stringOfPathsInOrder[i], frames: '2-4', outputType: 'png', cumulative: false },
          function (err, frameData) {
            if (err) {
              throw err;
            }
            frameData.forEach(function (frame) {
              frame.getImage().pipe(createWriteStream(
                `${basePath}\\ultron-layers-frames\\${secondToLast}\\${last}\\${last}-frame-${frame.frameIndex}.png`
              ))
            });
          }
        );
      }
    }
    console.log('done extract files');
  }

  async function createGif(algorithm, imagesFolder, finalFileName) {
    return new Promise(async resolve1 => {
      const files = await readdirAsync(imagesFolder)
      
      const dstPath = path.join(basePath, 'ultron-output-final', `${finalFileName}.gif`)
  
      const writeStream = createWriteStream(dstPath)
  
      writeStream.on('close', () => {
        resolve1()
      })
  
      const encoder = new GIFEncoder(format.width, format.height, algorithm)
  
      encoder.createReadStream().pipe(writeStream)
      encoder.start()
      encoder.setDelay(200)
  
      const canvas = createCanvas(format.width, format.height)
      const ctx = canvas.getContext('2d')
  
      for (const file of files) {
        await new Promise(resolve3 => {
          const image = new Image()
          image.onload = () => {
            ctx.drawImage(image, 0, 0, format.width, format.height)
            encoder.addFrame(ctx)
            resolve3()
          }
          image.src = path.join(imagesFolder, file)
        })
      }
    })
  }
})();
