'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {
  dialogflow,
  Permission,
  Suggestions,
  BasicCard,
  Carousel,
  Image,
  Button,
  List,
  Table,
  BrowseCarousel,
  BrowseCarouselItem
} = require('actions-on-google');

const _=require('lodash');
const axios=require('axios');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');
const admin=require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://devfest-19.firebaseio.com/'
});

const db=admin.firestore();
const bucket=admin.storage().bucket('gs://devfest-19.appspot.com/');
const bucketAccess={
  action: 'read',
  expires: Date.now()+ 1000*60*60
};

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

//const locale = app.getUserLocale();

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  conv.ask("Hey there! You are in the right place");  
  conv.ask(new BasicCard({
    title:"GDG Kolkata",
    text:"",
    image:new Image({
      url:"https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/gdg.png?alt=media&token=4d595500-9411-4f29-920b-fea302380a7f",
      alt:"GDG Logo"
    }),
    buttons: new Button({
      title:"Join the community",
      url: "https://www.meetup.com/GDG-Kolkata/"
    })
  }));//basic card ends here
  conv.ask("Let's get you rolling. "+
			"Welcome to Google Developers's Group, Kolkata. You will find all the latest upcoming events in the Suggestion Chips. Let the breadcrumbs guide your way!");
  conv.ask(new Suggestions("DevFest'19"));
  });

app.intent('DevFest_Home', (conv) => {
  conv.ask("Here's all you need to know about one of the biggest Tech confluence in Eastern India!");
  conv.ask(new BasicCard({title:"GDG DevFest Kolkata '19",
                          subtitle:"Novotel, Kolkata",
                          image:new Image({
                            url:"https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432",
                            alt:"GDG DevFest Kolkata"                           
                            }),
                          buttons:new Button({
                            title:"Visit Official Site",
                            url: "https://devfest.gdgkolkata.org/"
                          })
                         }));//Basic Card ends here
  conv.ask("Welcome to the Biggest Developer Community Event in Kolkata, GDG DevFest'19. This is where you will get every detail about the event. From Live Updates to Developer Sessions.\nPS: Invites are already being rolled out. Keep an eye out!");
  conv.ask("What would you like to explore?");
  conv.ask(new Suggestions('About DevFest','Grab a Pass','Tracks','Speakers','Important Dates','Venue','Organisers','The Team',"Home",'Exit')); //,'Sessions','Sponsors','About DevFest','Announcements'
   });
//This intent handles the Team details
app.intent('the team',(conv)=>{
  conv.ask("Here are the different teams...");
  const carousel_ = new List({
  items: {
    // Add the first item to the carousel
    'On Ground':{
      title:'On Ground',
      description: 'You will find them on D-Day!',
    },
    'Web':{
      title:'Web',
      description: 'The Official Site Builders!',
    },
    'App': {
      title: 'App',
      description: 'Head over to the Playstore to find their Baby!', 
    },
    'Action':{
      title: 'Action',
      description: 'You can Thank them for this conversation.',
    },
    'Outreach':{
      title: 'Outreach',
      description: 'The ones with the best Networking skills.',
    },
    'Design':{
      title: 'Design',
      description: 'Everything that looks cool is because of them.',
    },
  }
  });
  conv.ask(carousel_); 
  conv.ask(new Suggestions('Home','Speakers','Exit'));
});
app.intent('the team - custom',(conv,{specific_team})=>{
  return new Promise((resolve,reject)=>{
    specific_team = conv.arguments.get('OPTION') || specific_team;
    
    console.log("Team received",specific_team);
    const teamFile=bucket.file('teamsdata.json');
    teamFile.download()
      .then(contents=>{
      const buffer=contents.toString();
      const teamData=JSON.parse(buffer).filter(person=> person.teams.includes(specific_team));
      //teamData contains the filtered data
      console.log("No. of Members",teamData.length);
      if(teamData.length<=9){
        conv.ask("Here...");
        var itemArr=[];
        teamData.forEach(person=>{
          itemArr.push(new BrowseCarouselItem({
            title:person.name,
            url: person.linkedin,
            description: "Get in touch at "+person.email,            
            image: new Image({
            url:"https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432",
            alt:"GDG DevFest Kolkata",
            }),
          }));//push ends
        });//forEach ends
        conv.ask(new BrowseCarousel({items:itemArr}));
      }else{
        conv.ask("Here...");
        var names="";
        teamData.forEach(person=>{
          names+=person.name+", ";
        });//forEach ends
        conv.ask(new BasicCard({
          text:"Members : "+names,
          subtitle:specific_team+" Consists of "+teamData.length+" developers.",
          title:"The "+specific_team+" Team",
          image:new Image({
            url:"https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432",
            alt:"DevFest'19 Image",
          }),
          buttons:new Button({
            title:"Know More",
            url:"https://devfest.gdgkolkata.org/team",
          }),
        }));//basiccard ends here
      }//if-else ends here
      conv.ask(new Suggestions('Home','Speakers'));
      resolve();
    })//then ends here
      .catch(err=>console.log("Error Occured!",err)); //File download ends
  });// promise ends here
});

app.intent('Sponsors',(conv) => {
    conv.ask("The event is enabled by our Sponsors and Partners. Visit the Site to check our sponsors.");
    conv.ask(new BasicCard({title:"GDG DevFest Kolkata '19",
                          subtitle:"Novotel, Kolkata",
                          image:new Image({
                            url:"https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432",
                            alt:"GDG DevFest Kolkata"                           
                            }),
                          buttons:new Button({
                            title:"Visit Official Site",
                            url: "https://devfest.gdgkolkata.org/"
                          })
    }));//Basic Card ends here
    conv.ask(new Suggestions('Speakers','Home','Exit'));
});

app.intent('About Devfest',(conv) => {
  	conv.ask("DevFests are community-led, developer events hosted by GDG chapters around the globe focused on community building and learning about Google’s technologies. Each DevFest is inspired by and uniquely tailored to the needs of the developer community and region that hosts it. DevFest'19 Kolkata is a landmark event hosted by GDG Kolkata in association with Women TechMakers and GDG Cloud Kolkata.");
    const carousel = new BrowseCarousel({
    items: [
      new BrowseCarouselItem({
        title: 'GDG Kolkata',
        url: 'https://gdgkolkata.org',
        description: 'Google Developers Group Kolkata',
        image: new Image({
          url: 'https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/gdg.png?alt=media&token=4d595500-9411-4f29-920b-fea302380a7f',
          alt: 'Image alternate text',
        }),
        footer: '',
      }),
      new BrowseCarouselItem({
        title: 'WTM Kolkata',
        url: 'https://wtmkolkata.in',
        description: 'Women TechMakers Kolkata',
        image: new Image({
          url: 'https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/WTM.png?alt=media&token=36675812-7c12-44d3-b854-6b994eea7211',
          alt: 'Image alternate text',
        }),
        footer: '',
      }),
      new BrowseCarouselItem({
        title: 'GDG Cloud Kolkata',
        url: 'https://www.meetup.com/Google-Developer-Group-Cloud-Kolkata/',
        description: 'GDG Cloud Kolkata',
        image: new Image({
          url: 'https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/gdg_cloud.png?alt=media&token=259e1f53-ff92-4560-b160-8a8627d637cb',
          alt: 'Image alternate text',
        }),
        footer: '',
      })
    ],
  });

  conv.ask(carousel);
  conv.ask('To Know More head over to the Official DevFest\'19, Kolkata Site or Subscribe to Notice Board.');
  conv.ask(new Suggestions('Notice Board','Home','Exit'));
});

app.intent("organisers",(conv) => {
  return new Promise((resolve,reject)=>{
    conv.ask("Here's the organizing team for DevFest'19");
    const coreFile=bucket.file('coreteamdata.json');
    coreFile.download()
      .then(contents=>{
      const buffer=contents.toString();
      const teamData=JSON.parse(buffer).filter(person=> person.name!="Tanmay Ghosh");
      var itemArr=[];
      teamData.forEach(person=>{
        itemArr.push(new BrowseCarouselItem({
          title:person.name,
          url:person.linkedin,
          description:"Twitter : "+person.twitter,
          image:new Image({
            url:person.profileImage,
            alt:"Profile Picture"
          }),
        }));//push ends here
      });//forEach ends here
      conv.ask(new BrowseCarousel({items:itemArr}));
      conv.ask("For More, visit the DevFest Kolkata Site or say \'About DevFest\'");
      conv.ask(new Suggestions('About DevFest','Home','Exit'));
      resolve();
    })//then ends here
      .catch(err=>console.log("Error Occured!",err));
  });//promise ends here
});

app.intent('notice board',(conv) => {
  conv.ask("All Updates are here !");

});

app.intent('notice board',(conv)=>{
  return new Promise((resolve,reject)=>{
  db.collection('important_dates').get().then(snapshot=>{
    var itemArr=[];// make a list
    conv.ask("This is the notice board, Subscribe to Push notification to stay updated. Is there anything else you'd like to know?");
    snapshot.docs.forEach(doc=>{
      var document=doc.data();
      var carouselItem=new BrowseCarouselItem({title:document.event.toString(),
                                               url: "https://sessionize.com/devfest-kolkata-2019",
                                               description: document.date.toString(),
                                               image:new Image({
                                                 url: "https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432",
                                                 alt: "URL Link"
                                               })                                               
                                              });//change to basic card
      itemArr.push(carouselItem);// add to the list of basic cards
     
    });
    conv.ask(new BrowseCarousel({items: itemArr})); //This is the response to the user's query.
      //add basic card or carousel instead of message.
    conv.ask(new Suggestions('Announcements','Home','Tracks','Exit'));
    resolve();
  }).catch(err=>{
  console.log("Getting Error",err);
    reject();
  });
  }); 
});

app.intent("Speakers",(conv) => {
  return new Promise((resolve,reject)=>{
    conv.ask("Please wait while we fetch the List!");
    conv.ask("This is arguably one of the best DevFest Speaker Lineup Till Date!");
    const speakersFile=bucket.file('speakersdata.json');
    speakersFile.download()
      .then(contents=>{
      const buffer=contents.toString();
      const data=JSON.parse(buffer);
      var itemArr={};
      data.forEach(person=>{
        const profile=person.links.filter(link=> link.title=="LinkedIn")[0].url;
        itemArr[person.fullName]={
          title:person.fullName,
          description: person.sessions[0].name,
          image:new Image({
            url:person.profilePicture,
            alt: 'Profile Picture',
          }),
        };//itemArr ends
      });//forEach ends
      console.log("ItemArr: ",itemArr);
      conv.ask(new List({items:itemArr}));
      conv.ask(new Suggestions('Register now','About DevFest','Dates to remember','Organisers'));
     
      resolve();
    })
      .catch(err=>console.log("Error Occured!",err));
  });
});
app.intent("Speakers - custom",(conv,{speakers})=>{
  return new Promise((resolve,reject)=>{
    speakers = conv.arguments.get('OPTION') || speakers;
    conv.ask("Here...");
    console.log("Speakers Value:",speakers);
    conv.ask(new Suggestions('Home','Sessions','Exit'));
    const speakersFile=bucket.file('speakersdata.json');
    speakersFile.download()
      .then(contents=>{
      const buffer=contents.toString();
      const speakerData=JSON.parse(buffer).filter(speaker=>speaker.fullName===speakers)[0];
	  //console.log("speakerData: ",speakerData);
      const profile=speakerData.links.filter(link=>link.title==="LinkedIn")[0].url;
      conv.ask(new BasicCard({
        text:speakerData.bio,
        title:speakerData.fullName,
        subtitle:speakerData.tagLine,
        buttons: new Button({
          title:"Find on LinkedIn",
          url:profile,
        }),
        image:new Image({
          url:speakerData.profilePicture,
          alt:"Profile Picture",
        }),
      }));//Basic Card ends here
      resolve();
    })//then ends here
      .catch(err=>console.log("Error Occured",err));
  });//Promise ends
});

//showing the list of sessions under each track
app.intent("show_sessions",(conv)=>{
   return new Promise((resolve,reject)=>{
     conv.ask("Here's the list of all Sessions that are going to take place this time:");
     const sessionsFile=bucket.file('sessionsdata.json');
     var itemArr={};
     sessionsFile.download()
       .then(contents=>{
       const buffer=contents.toString();
       const data=JSON.parse(buffer)[0].sessions;
       data.forEach(session=>{
         const title=session.title;
         const speaker=session.speakers[0].name;
         itemArr[title]={
           title:title,
           description:"By : "+speaker,
         };
       });//forEach ends here.
       conv.ask(new List({
         title:"Sessions Happening at DevFest19 Kolkata",
         items:itemArr,
       }));//list ends here
       conv.ask("Click on the Session to Know More");
       conv.ask(new Suggestions('Home','Tracks','Exit'));
       resolve();
     })//then ends here
       .catch(err=> console.log("Error Occured!",err));
  });

});
app.intent("show_sessions - custom",(conv,{session_title})=>{
  return new Promise((resolve,reject)=>{
    session_title= conv.arguments.get('OPTION') || session_title;
    
    console.log("session_title ",session_title);
    const sessionFile=bucket.file('sessionsdata.json');
    sessionFile.download()
      .then(contents=>{
      conv.ask("Here's more about it...");
      const buffer=contents.toString();
      const sessionData=JSON.parse(buffer)[0].sessions.filter(session=>session.title===session_title)[0];
      const room=sessionData.room===null? '<to be updated>': sessionData.room;
      const startTime=sessionData.startsAt===null? '<to be updated>': sessionData.startsAt;
      const audience=sessionData.categories[2].categoryItems[0].name;
      const sessionType=sessionData.categories[0].categoryItems[0].name;
      
      conv.ask(new BasicCard({
        text:"Session Type : "+sessionType+" || Audience Level : "+audience+" || Start Time : "+startTime+" || Room : "+room,
        title:sessionData.title,
        subtitle:"Speaker : "+sessionData.speakers[0].name,
        buttons: new Button({
          title: "Watch Live",
          url: "https://devfest.gdgkolkata.org"
        }),
        image: new Image({
          url:"https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432",
          alt: "DevFest'19 Image"
        }),
      }));//basic card ends here
      conv.ask('Subscribe to the Notice Board to get Regular Updates!');
      conv.ask(new Suggestions('Home','Sessions','Tracks','Exit'));
      resolve();
    }) //then ends here
      .catch(err=>console.log('Error Occured!',err));//catch ends here
    
  });//Promise ends here
});
app.intent('Tracks',(conv)=>{
  conv.ask("This Year, You would find the following Tracks at DevFest'19, Kolkata");
  const carousel_ = new List({
  items: {
    // Add the first item to the carousel
    'Cloud': {
      title: 'Cloud',
      description: 'Special Session on Google Cloud Platform.', },
    'ML':{
      title: 'ML',
      description: 'Improve your ML Game!',
    },
    'Web':{
      title: 'Web',
      description: 'The true Homecoming.',
    },
    'Mobile':{
      title: 'Mobile',
      description: 'Find the right Tech to build your dream app!',
    },
  }
  });
  conv.ask(carousel_);  
  conv.ask(new Suggestions('Speakers','Return Home'));

});

app.intent('Tracks - custom',(conv,{tracks})=>{
  return new Promise((resolve,reject)=>{
    tracks = conv.arguments.get('OPTION') || tracks;
    conv.ask("Talks in store. Click on the Talk to Watch Live!");
    console.log("Tracks Custom-",tracks);
    const sessionFile=bucket.file('sessionsdata.json');
    sessionFile.download()
      .then(contents=>{     
      var itemArr=[];
      const buffer=contents.toString();
      const sessionData=JSON.parse(buffer)[0].sessions;
      const filteredData=sessionData.filter(session=> session.tracks.includes(tracks));
      console.log("Filtered Data:",filteredData);
      if(filteredData.length>1){
        console.log("Filtered Data Length",filteredData.length);
        filteredData.forEach(session=>{
          
          console.log("Session Speaker:",session.speakers);
          const roomData=session.room===null ? '<To Be Updated>':session.room;
          itemArr.push(new BrowseCarouselItem({
            title:session.title,
            url: 'https://devfest.gdgkolkata.org/speakers',
            description:"Speaker: "+session.speakers[0].name,//add image here
            footer:"Room: "+roomData                         
          }));//itemArr ends
        });// forEach ends
        conv.ask(new BrowseCarousel({
          items:itemArr,
        }));//conv List ends
      } else if(filteredData.length===1){
        var single=filteredData[0];
        const roomData=single.room===null ? '<To Be Updated>':single.room;
        conv.ask(new BasicCard({
          text: "Room: "+roomData+" About: "+single.description.slice(0,70)+"...",
          title: single.title,
          subtitle: single.speakers[0].name,
          buttons:new Button({
            title:"Go to Live Cast",
            url: "devfest.gdgkolkata.org"
          }),//add image here
        }));//conv BasicCard
      }//else if ends
      conv.ask(new Suggestions('Cloud','Ml','Web','Mobile','Register','Go back Home','Exit'));
      resolve();  
    })
      .catch(err=>console.log("Error Occured!",err));//file download ends

  }); //Promise ends
});

app.intent("Register",(conv) => {
  conv.ask("Get your pass here .... ");
const card = new BasicCard({
    title: 'Get your Passes to the Biggest Community Event in Kolkata Now!',
    text: 'GDG Devfest Kolkata 2019 is happening at Novotel Kolkata, subscribe to Notice Board Announcements to stay updated!',
    image: new Image({
    url: 'https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432', //insert venue image
    alt: 'Image alternate text',
  }),
  buttons: new Button({
    title: 'Get a Pass',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfnitNzIblk6ciVqYgIHRM303Dl44ZvpAtMcqvqWQeQUBYLdw/viewform',  
  }),
    display: 'CROPPED',
  });
  
  conv.ask(card);
  conv.ask(new Suggestions("Know more about Tracks","Speakers","Home"));

});

app.intent('Venue',(conv) => {
conv.ask("Find us here .... ");
const card = new BasicCard({
    title: 'See you there!',
    text: 'Novotel Kolkata Hotel And Residences',
    image: new Image({
    url: 'data:image/jpeg;base64,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', //insert venue image
    alt: 'Image alternate text',
  }),
  buttons: new Button({
    title: 'Get Directions',
    url: 'https://goo.gl/maps/mzCwyBK1HcXnhmXR9', //replace with direction link 
  }),
    display: 'CROPPED',
  });
  
  conv.ask(card);
  conv.ask(new Suggestions("Register","Know more about Tracks","Speakers","Home"));
});
// most important and biggest intent. Will begin coding shortly. - Abhik
app.intent('Backup_Intent',(conv,params)=> {
  return new Promise((resolve,reject)=>{
    //conv.ask("The Breadcrumbs shall guide the way!");
    console.log("Parameters Received:",params);
    //extracting parameters
    
    const person=params.person;
    const sessionDetails=params.sessions;
    const team=params.specific_team;
    const tracks=params.tracks; 
    const isOrganizer=params.organisers;
    
    const f1=typeof(person)=="string" ? false :true; //personFlag
    const f2=sessionDetails.length===0?false:true; //sessiondetailsflag
    const f3=team.length===0?false:true; //team flag
    const f4=tracks.length===0?false:true; //tracks flag
    const f5=isOrganizer.length===0?false:true; //organizer flag
    var file;
    console.log("Person ",person," isOrganizer ",isOrganizer,"sessionDetails ",sessionDetails," team ",team.length," tracks ",tracks);
    console.log("Type of : Person ",typeof(person)," isOrganizer ",typeof(isOrganizer),"sessionDetails ",typeof(sessionDetails)," team ",typeof(team)," tracks ",typeof(tracks));
    // various conditions start here
    
    if(f1 && f3){
      console.log("Person & team Present",person,team);
      file=bucket.file('teamsdata.json');
      file.download()
        .then(contents=>{
        const buffer=contents.toString();
        const teamData=JSON.parse(buffer).filter(teamMate=>teamMate.name.toLowerCase()===person.name.toLowerCase())[0];//contains the required person
        console.log("Person Chose",teamData);
        var personTeam="Part of : ";
        teamData.teams.forEach(team=>personTeam=personTeam+team+" ; ");
        conv.ask(new BasicCard({
          title:teamData.name,
          subtitle:personTeam,
          text:"You can contact me at "+teamData.email,
          buttons:new Button({
            title:"Find on LinkedIn",
            url:teamData.linkedin
          }),
        }));//basic card ends here
        conv.ask(new Suggestions('Home','Speakers','Tracks','Sessions','Get Your Pass','About DevFest','Exit'));
        resolve();
      })
        .catch(err=>console.log("Error Occured while accessing teamsdata",err));//file download ends
      //person && team ends
    }else if((f1 && f2) || (f4 && f1)){
      console.log("Person and (Session  or tracks) Present",sessionDetails,person,tracks);
      file=bucket.file('sessionsdata.json');
      file.download()
        .then(contents=>{
        const buffer=contents.toString();
        var sessionData=JSON.parse(buffer)[0].sessions.filter(session=>{
          console.log("Speaker Names for",session.title,_.pick(session.speakers,['name'])); //printing speaker names
          const bufferArr=session.speakers.filter(eachSpeaker=> eachSpeaker.name.toLowerCase()===person.name.toLowerCase());
          if(bufferArr.length>0) return true;
          else return false;
        });//filtering ends here sessionsData contains the session detail.
        console.log("Sessions details",sessionData); //printing sessions data
        if(sessionData.length>0){
          sessionData=sessionData[0];
          conv.ask("Here's what you are looking for...");
          const room=sessionData.room===null? '<to be updated>': sessionData.room;
          const startTime=sessionData.startsAt===null? '<to be updated>': sessionData.startsAt;
          const audience=sessionData.categories[2].categoryItems[0].name;
          const sessionType=sessionData.categories[0].categoryItems[0].name;
          conv.ask(new BasicCard({
            text:"Session Type : "+sessionType+" || Audience Level : "+audience+" || Start Time : "+startTime+" || Room : "+room,
            title:sessionData.title,
            subtitle:"Speaker : "+sessionData.speakers[0].name,
            buttons: new Button({
              title: "Watch Live",
              url: "https://devfest.gdgkolkata.org"
            }),
            image: new Image({
              url:"https://firebasestorage.googleapis.com/v0/b/devfest-19.appspot.com/o/banner%20-%20Copy.png?alt=media&token=7f7785ad-cc6c-4102-912b-7608e4929432",
              alt: "DevFest'19 Image"
            }),
          }));//basic card ends here
        }else conv.ask("There might be some mistake in what you said, could you please check?");
        conv.ask("You can always check out the Official DevFest'19 Site for more!");
        conv.ask(new Suggestions('Home','Speakers','Tracks','Sessions','Get Your Pass','About DevFest','Exit'));
        resolve();
      })
        .catch(err=>console.log("Error Occured while accessing teamsdata",err));//file download ends
      
    }else if(f5 && f1){
      console.log("Need to search organizer's list");
      file=bucket.file('coreteamdata.json');
      conv.ask("Here...");
      file.download()
        .then(contents=>{
        const buffer=contents.toString();
        var corePerson=JSON.parse(buffer).filter(buf=> buf.name!="Tanmay Ghosh" && person.name.toLowerCase()===buf.name.toLowerCase());
        console.log("Core Person",corePerson);
        if(corePerson.length>0){ 
          	corePerson=corePerson[0];
          	
        	conv.ask(new BasicCard({
            text:"Twitter : "+corePerson.twitter,
            title:corePerson.name,
            subtitle:corePerson.designation,
            image:new Image({
              url:corePerson.profileImage,
              alt:"Profile Image",
            }),
            buttons:new Button({
              title:"Connect Over LinkedIn",
              url:corePerson.linkedin
            }),
          }));//BasicCard Ends here
        }else conv.ask("I don't think so. But You can always check the official site!");
        conv.ask(new Suggestions('Home','Speakers','Tracks','Sessions','Get Your Pass','About DevFest','Exit'));
    	resolve();
      })
        .catch(err=>console.log('Error happened while accessing coreteamdata.json',err));//file download ends here
    }else if(f4){
      console.log("Just tracks Present",tracks);
      conv.ask("Here are the Session in this track. Click on them to Watch Live!");
      file=bucket.file('sessionsdata.json');
      file.download()
        .then(contents=>{     
        var itemArr=[];
        const buffer=contents.toString();
        const sessionData=JSON.parse(buffer)[0].sessions;
        const filteredData=sessionData.filter(session=>session.tracks.filter(eachTrack=>eachTrack.toLowerCase()===tracks.toLowerCase()).length>0);//Filtering ends here, filteredData contains the sessions
        console.log("Filtered Data:",filteredData);
        if(filteredData.length>1){
          console.log("Filtered Data Length",filteredData.length);
          filteredData.forEach(session=>{
            console.log("Session Speaker:",session.speakers);
            const roomData=session.room===null ? '<To Be Updated>':session.room;
            itemArr.push(new BrowseCarouselItem({
              title:session.title,
              url: 'https://devfest.gdgkolkata.org',
              description:"Speaker: "+session.speakers[0].name,//add image here
              footer:"Room: "+roomData                         
            }));//itemArr ends
          });// forEach ends
          conv.ask(new BrowseCarousel({
            items:itemArr,
          }));//conv List ends
        conv.ask(new Suggestions('Home','Speakers','Tracks','Sessions','Get Your Pass','About DevFest','Exit'));
    	resolve();
        } else if(filteredData.length===1){
          var single=filteredData[0];
          const roomData=single.room===null ? '<To Be Updated>':single.room;
          conv.ask(new BasicCard({
            text: "Room: "+roomData+" About: "+single.description.slice(0,70)+"...",
            title: single.title,
            subtitle: single.speakers[0].name,
            buttons:new Button({
              title:"Go to Live Cast",
              url: "https://devfest.gdgkolkata.org"
            }),//add image here
          }));//conv BasicCard
        conv.ask(new Suggestions('Home','Speakers','Tracks','Sessions','Get Your Pass','About DevFest','Exit'));
    	resolve();
        }//else if ends
      }).catch(err => console.log("Error Occured in Accessing tracks data",err));
      
    }else if(f1){
      console.log("Just Person Present. No other Info",person);
      conv.ask("Could you Please elaborate? What do you want to know about",person.name,"?");
      conv.ask(new Suggestions('Home','Speakers','Tracks','Sessions','Get Your Pass','About DevFest','Exit'));
      resolve();
    }else{
      conv.ask("The Breadcrumbs shall guide the way!");
      conv.ask("Watch out for Suggestions!");
      conv.ask(new Suggestions('Home','Speakers','Tracks','Sessions','Get Your Pass','About DevFest','Exit'));
      resolve();
    }    
  });//Promise ends here
});





// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);