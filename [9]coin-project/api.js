module.exports = (app) => {

	const request = require('request');

	///// korbit
	const getKorbitData = (symbol) => {
		return new Promise((resolve, reject) => {
			request.get(`https://api.korbit.co.kr/v1/ticker?currency_pair=${symbol}_krw`,
			  function(error, response, body) {
			  	if(error){
			  		reject();
			  		return;
			  	}

			  	const data = JSON.parse(body);

			    resolve(data.last);
			});		
		});
	}

	const getBitfinanceData = (symbol) => {
		return new Promise((resolve, reject) => {
			request.get(`https://api.bitfinex.com/v1/pubticker/${symbol}usd`,
			  function(error, response, body) {
			    if(error) {
			    	reject();
			    	return;
			    }
			    
				const data = JSON.parse(body);

			    resolve(data.last_price);
			});
		});
	}


	const getExchangeRate = () => {
		return new Promise((resolve, reject) => {
			request.get('https://api.fixer.io/latest?symbols=USD,KRW',
			  function(error, response, body) {
			    if(error) {
			    	reject();
			    	return;
			    }

			    const data = JSON.parse(body);			    
			    
			    resolve(data);
			});
		});	
	}


	app.getPremium = () => {
		return new Promise((resolve, reject) => {
			Promise.all([getKorbitData('btc'), getBitfinanceData('btc'), getExchangeRate()]).then((values) => {
				const ko_krw = values[0];
				const en_usd = values[1];

				const krw_rate = values[2].rates.KRW;
				const usd_rate = values[2].rates.USD;

				const premium_price = ko_krw - (en_usd * krw_rate / usd_rate);
				const premium_percent = premium_price*100/ko_krw;				

				const result = {premium_price, premium_percent};
				resolve(result);			
			});
		});		
		
	}

	app.getPrice = (symbol) => {
		return new Promise((resolve, reject) => {
			getKorbitData(symbol).then((value) => {
				const result = {value};
				resolve(result);
			});
		});
	}

}