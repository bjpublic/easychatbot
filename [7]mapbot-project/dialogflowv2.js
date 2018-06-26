module.exports = function(app) {

	const request = require('request');
	const admin = require("firebase-admin");
	const serviceAccount = require("[어드민 SDK JSON 패스]");

	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount),
	  databaseURL: "https://ghbot-762ee.firebaseio.com/"
	});	
		
	const projectId = 'ghbot-762ee'; //https://dialogflow.com/docs/agents#settings
	const sessionId = 'my-session-id';
	const languageCode = 'en-US';
		
	const dialogflow = require('dialogflow');
	const sessionClient = new dialogflow.SessionsClient();
	
	const sessionPath = sessionClient.sessionPath(projectId, sessionId);

	app.post('/process', (req, res) => {		
	  	const query = req.body.query;

	  	if(!query){
	  		res.json({flag: 0});
	  		return;
	  	}	  	

	  	// The text query request.
		const textReq = {
		  session: sessionPath,
		  queryInput: {
		    text: {
		      text: query,
		      languageCode: languageCode,
		    },
		  },
		};


	  	// Send request and log result
		sessionClient
		  .detectIntent(textReq)
		  .then(responses => {
		    console.log('Detected intent');
		    const result = responses[0].queryResult;
		    console.log(`  Query: ${result.queryText}`);
		    console.log(`  Response: ${result.fulfillmentText}`);
		    if (result.intent) {	   		      
		      console.log(`  Intent: ${result.intent.displayName}`);
		      const intent_name = result.intent.displayName;

		      if(intent_name=='near_location'){
		      	const location = result.parameters.fields.location.structValue.fields["street-address"].stringValue;		      	
		      	getGeocode(location).then((data) => {
			      	const jsonObj = JSON.parse(data);			      	

		      		res.json({flag: 1, type: 0, data: jsonObj.results[0].geometry.location});
		      	}).catch((err) =>{
		      		console.error(err);
		      		res.json({flag: 0});
		      	});
		      } else if(intent_name=='find_location'){
		      	const ghname = result.parameters.fields.gh_name.stringValue;
		      	findGhInfo(ghname).then((data) => {

		      		res.json({flag: 1, type: 1, data: data})
		      	}).catch((err) =>{
		      		console.error(err);
		      		res.json({flag: 0});
		      	});		      	
		      }
		      
		    } else {
		      console.log(`  No intent matched.`);
		      res.json({flag: 0});
		    }
		  })
		  .catch(err => {
		    console.error('error:', err);
		    res.json({flag: 0});
	  	  });

	  });

	  
	function getGeocode(addr){
		return new Promise((resolve, reject) => {
			const address = encodeURI(addr);

			const api_key = '[맵 API 키]';
			const api_url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${api_key}`;
		    
		    request.get({url: api_url}, function (error, response, body) {
		     if (!error && response.statusCode == 200) {		     	
		       resolve(body);
		     } else {
		       reject(error);		       
		     }
		    });
	    });
	}


	function findGhInfo(ghname){
		return new Promise((resolve, reject) => {
		    admin.database().ref('/guesthouses')
	        .once('value', function(snapshot) {
	        	snapshot.forEach(function(childSnapshot) {
	    			var childKey = childSnapshot.key;
	    			var info = childSnapshot.val();

	    			if(info.enname == ghname){	    				
	    				resolve(info);
	    				return;
	    			}
	    		});

	    		reject("no guesthouse");
	        });        
	    });
	}
	

}