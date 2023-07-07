const express=require("express");
const ejs=require("ejs"); 
const path=require("path");
const fs=require('fs');
const { fileURLToPath } = require("url");
//Creating our server
const app=express();

app.use(express.json());

//Setting up EJS
app.set("view engine","ejs")

app.use(express.static(path.join(__dirname,"/public")));

const PORT=process.env.PORT || 3000;

//Query handling GET,POST,PATCH,DELETE

//desc: Get request to home page

app.get("/",(req,res)=>{
  res.render("index");
});


app.get("/search",(req,res)=>{
  const query=req.query;
  const question=query.question;
  //TF IDF Algo
  var keyword=fs.readFileSync("./Data/keyword.txt").toString().split('\n');
  var mag=fs.readFileSync("./Data/Magnitude.txt").toString().split('\n');
  var idf=fs.readFileSync("./Data/IDF.txt").toString().split('\n');
  var tfidf=fs.readFileSync("./Data/TFIDF.txt").toString().split('\n');
  u=question.toString().split(" ");
  var ans=new Array(3462).fill(0);
  const freq={};
  let usize=Object.keys(u).length;
  for(let i=0;i<usize;i++){
      u[i]=u[i].toLowerCase();
      if(freq[u[i]]) freq[u[i]]++;
      else freq[u[i]]=1;
  }
  let n=0;
  let kk=0;
  let idfsize=Object.keys(idf).length;
  var idx=new Array(Object.keys(u).length).fill(-1);
  for(let i=0;i<usize;i++){
     for(let j=0;j<idfsize;j++){
       if(keyword[j]==u[i]){
         idx[i]=j;
         n+=1;
         ans[j]=(parseFloat(idf[j]*freq[u[i]]))
         kk+=(ans[j]*ans[j])
       }
     }
  }
  kk/=n;
  kk/=n;
  kk=Math.sqrt(kk)
  for(let j=0;j<idfsize;j++){
    ans[j]/=n;
  }
  var arr=new Array(3460)
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(3373).fill(0.0);
  }
  for(let i=0;i+2<137586;i+=3){
     arr[parseInt(tfidf[i])-1][parseInt(tfidf[i+1])-1]=parseFloat(tfidf[i+2])
    
  }
  var dotprod=new Array(3373);
  for(let i=0;i<3373;i++){
    dotprod[i]=new Array(2);
    dotprod[i][1]=i;
    dotprod[i][0]=0;
    for(let j=0;j<usize;j++){
      if(idx[j]!=-1){
        dotprod[i][0]+=(arr[idx[j]][i]*ans[idx[j]])
        if(kk>0)dotprod[i][0]/=(kk*parseFloat(mag[i]));
      }
   }
  }
  
  dotprod.sort((a,b)=>b[0]-a[0]);
   var tt=fs.readFileSync("./Data/problem_title.txt").toString().split('\n')
   var ads=fs.readFileSync("./Data/problem_url.txt").toString().split('\n')
  
  var qs=new Array(40);
  for(let i=0;i<40;i++){
    qs[i]=fs.readFileSync(`./Data/problem${dotprod[i][1]+1}.txt`).toString();
  }
setTimeout(()=>{
     //Return top 10 results
  const arr=new Array(10);
  let ct=0;
  let i
  const ch={};
   for(i=0;i<40 && ct<10;i++){
     if(ch[tt[dotprod[i][1]]]) continue;
     else ch[tt[dotprod[i][1]]]=1;
     arr[ct]={
      title:tt[dotprod[i][1]],
      url:ads[dotprod[i][1]],
      statement:qs[i],
    }
    ct++;
  }

 // console.log(arr)
  res.json(arr);
  },2000)
 
});

//Assigning PORT to our application
app.listen(PORT, ()=>{
    console.log("Server is running on port"+PORT);
});
