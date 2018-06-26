const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const DialogflowApp = require('actions-on-google').DialogflowApp;


exports.assistant = functions.https
.onRequest((request, response) => {

	const app = new DialogflowApp({request: request, response: response});  	
	app.handleRequest(handlerRequest);


	function handlerRequest(assistant) {	  	 
	  const location = assistant.getArgument('location');
	  const time = assistant.getArgument('time');
	  const info = assistant.getArgument('info');
	  const speakers = assistant.getArgument('speakers');

	  const ticket = assistant.getArgument('ticket');
	  const price = assistant.getArgument('price');
	  const discount = assistant.getArgument('discount');
	  const payment = assistant.getArgument('payment');

	  let message,	      
	      statements = [];

	  getGroupInfo({
	    onSuccess: function(data) {	      

	      if(location && location.length>0){
	      	statements.push("행사 주소는 "+data.info.location + " 입니다.");	      	
	      }

	      if(time && time.length>0) {
	      	statements.push("행사 시작 시간은 "+data.info.time + " 입니다.");
	      }

	      if(info && info.length>0) {
	      	statements.push("이 행사는 "+data.info.info + " 입니다.");
	      }

	      if(speakers && speakers.length>0){
	      	statements.push("행사 스피커 리스트는 "+data.info.speakers + " 입니다.");
	      }

	      if(ticket && ticket.length>0){
	      	statements.push("티켓 정보에 대해 알려드릴게요.");
	      }

	      if(price && price.length>0){
	      	statements.push("티켓 가격은 "+data.info.price + " 입니다.");
	      }

	      if(discount && discount.length>0){
	      	statements.push("할인 정보 : "+data.info.discount);
	      }

	      if(payment && payment.length>0){
	      	statements.push("결제 정보 : "+data.info.payment);
	      }

		  message = statements.join(" ");	      
	      
	      response.json({ 'speech': message, 'displayText': message });
	    }
	  });
	}
});


function getGroupInfo(options) {   
    admin.database().ref('/group-info')
    .once('value')
    .then(function(snapshot){
    	const info = snapshot.val();
    	options.onSuccess({info: info});
    });
}
