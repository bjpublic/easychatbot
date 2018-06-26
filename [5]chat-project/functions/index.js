const functions = require('firebase-functions');
const gcs = require('@google-cloud/storage')();
const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.addWelcomeMessages = functions.auth.user().onCreate(event => {
  const user = event.data;  
  const fullName = user.displayName || 'Anonymous';

  return admin.database().ref('messages').push({
    ctype: 0,
    username: 'notify',    
    content: `${fullName} 님이 들어왔습니다!!` 
  }).then(() => console.log('Complete...'));
});


exports.analyzeImage = functions.storage.object().onChange(event => {
	const object = event.data;    
  	if (object.resourceState === 'not_exists') {
    	return console.log('deletion event.');
  	} else if (!object.name) {
    	return console.log('deploy event.');
  	}

  const imageUri = `gs://${object.bucket}/${object.name}`;  	
  	
	return client	  
	  .labelDetection(imageUri)
	  .then(results => {
	    const labels = results[0].labelAnnotations;
	 	    
      admin.database().ref('messages').push({
        ctype: 0,
        username: 'notify',
        content: `이 이미지는 ${labels[0].description} 입니다`
      });	    
      
	  })
	  .catch(err => {
	    console.error('error:', err);
	  });

});