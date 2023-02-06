const https = require('https');
const JSSoup = require('jssoup').default;
const fs = require('fs');
const url = "https://en.wikipedia.org/wiki/Chiho_Aoshima"; // FIRST: find a url of a page you are interested in from wikipedia 
const jsonPath = "./json/"; 
const name = "Chiho2";


/*
This web-scraping example is set up for working with wikipedia.If you want to adapt this
to scrape another site you should go and inspect the site in the browser first, then adapt this. 
*/

//returns one large string of all text
function getParagraphText(soupTag){
    let paragraphs = soupTag.findAll('p');
    let text = '';

    
    for(let i = 0; i < paragraphs.length; i++){
       // text += paragraphs[i].getText();
        let p = paragraphs[i].getText().toLowerCase();

       if(p.indexOf("chiho") != -1){
          console.log(p);
          text += p;
       }
    }

    return text;
}

function getAllExternalLinks(soupTag){
    let aTags = soupTag.findAll('a'); // return an array of SoupTag object
    let links = [];
   
    for(let i = 0; i < aTags.length; i++){
        let attrs = aTags[i].attrs;// get a tag attributes

        // if there is an href attribute in attires let's get it
        if('href' in attrs){
            let hrefValue = attrs.href;
           // if(hrefValue.indexOf("index.php") == -1 && hrefValue[0]!= "#" ){ //these are not images
                
                links.push(hrefValue);
           // }
           
        }
 
    }

    return links;
}


//pass in Plain Old Javascript Object that's formatted as JSON
function writeJSON(data){
    try {
        let path = jsonPath+name+".json";
        fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
        console.log("JSON file successfully saved");
    } catch (error) {
        console.log("An error has occurred ", error);
    }
}

//create soup  
function createSoup(document){
    
    let soup = new JSSoup(document);
    let data = {
        "name": name,
        "url": url,
        "content": {}
    }; 

    let main = soup.find('main');//only get the content from the main body of the page
         console.log(main);
    data.content = {
        "text": getAllExternalLinks(main)
    };
        
    //output json
    writeJSON(data);

}

//Request the url
https.get(url, (res) => {
    console.log('statusCode:', res.statusCode);
    //console.log('headers:', res.headers);
    
    let document = [];

    res.on('data', (chunk) => {
        document.push(chunk);
    }).on('end', () => {
        document = Buffer.concat(document).toString();
         //console.log(document);
        createSoup(document);
    });

}).on('error', (e) => {
    console.error(e);
});

