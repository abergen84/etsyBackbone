"use strict";

console.log('incoming..')

var EtsyCollection = Backbone.Collection.extend({
	url: "https://openapi.etsy.com/v2/listings/active.js",
	_apikey: "4jls0ietsf4fdx1hkkdghcie",
	parse: function(rawJSON) {
		console.log(rawJSON.results)
		return rawJSON.results
	} 	
})

var EtsyModel = Backbone.Model.extend({
	url: function() {
		return "https://openapi.etsy.com/v2/listings/" + this.id + '.js'
	},
	
	_apikey: "4jls0ietsf4fdx1hkkdghcie",
	
	parse: function(rawJSON) {
		console.log(rawJSON)
		return rawJSON.results
	},

	initialize: function(id) {
		this.id = id
	}
})

var EtsyMultipleView = Backbone.View.extend({

	el: document.querySelector("#container"),

	initialize: function(coll) {
		this.coll = coll
		var boundRender = this._render.bind(this)
		this.coll.on('sync', boundRender)
	},

	_render: function(){
		console.log(this.coll)
		var htmlString = ''
		var listingsArray = this.coll.models
		console.log(listingsArray)
		for(var i = 0; i < listingsArray.length; i++) {
			// htmlString += '<span>Latest 25 entries</span>'
			htmlString += '<div data-id="' + listingsArray[i].attributes.listing_id + '" class="item-box">'
			htmlString += '<h3>' + listingsArray[i].attributes.title.substring(0,30) + '...</h3>'
			htmlString += '<img src="' + listingsArray[i].attributes.Images[0].url_170x135 + '">'
			htmlString += '<p>$' + listingsArray[i].get('price') + '</p>'
			htmlString += '</div>'

			this.el.innerHTML = htmlString
		}		
	},

	events: {
		"click .item-box": "_handleClick"
	},

	_handleClick: function(eventObj){
		console.log(eventObj)
		var singleId = eventObj.currentTarget.getAttribute('data-id') //WOW, target vs currentTarget, when i click
		console.log(singleId)										//on the h3 it doesnt work, but on box it does
		location.hash = "detail/" + singleId 						//need to put the currentTarget to catch it all
	}
})

var EtsySingleView = Backbone.View.extend({
	
	el: document.querySelector("#container"),

	initialize: function(mod) {
		this.mod = mod
		console.log(this.mod)
		var boundRender = this._render.bind(this)
		this.mod.on('sync', boundRender)
	},

	_render: function() {
		var singleListingBase = this.mod.attributes[0]
		console.log(this.mod)
		console.log(singleListingBase)
		var singleItemRender = "<div class='indie-item'><img src='" + singleListingBase.Images[0].url_570xN + "'><h3>" + singleListingBase.title + "</h3><p>Price: $" + singleListingBase.price + "</p><p>" + singleListingBase.description + "</p></div>"

		this.el.innerHTML = singleItemRender
	}
})

var EtsyRouter = Backbone.Router.extend({
	routes: {
		"search/:keywords": "doSearch",
		"detail/:id":"doDetailView",
		"home":"goHome",
		"*catchall":"returnToHomepage"
	},

	goHome: function() {
		var etsyCollection = new EtsyCollection()
		etsyCollection.fetch({
			dataType: 'jsonp',
			data: {
				api_key: etsyCollection._apikey,
				includes: "Images,Shop"
			}
		})

		var etsyMultipleView = new EtsyMultipleView(etsyCollection)
	},

	doSearch: function(keywords) {
		var searchCollection = new EtsyCollection()
		searchCollection.fetch({
			dataType: 'jsonp',
			data: {
				api_key: searchCollection._apikey,
				includes: "Images,Shop",
				keywords: keywords
			}
		})

		var searchView = new EtsyMultipleView(searchCollection)
	},

	doDetailView: function(id) {
		var etsyModel = new EtsyModel(id)
		etsyModel.fetch({
			dataType: 'jsonp',
			data: {
				api_key: etsyModel._apikey,
				includes: "Images,Shop"
			}
		})
		var etsySingleView = new EtsySingleView(etsyModel)
	},

	returnToHomepage: function() {
		location.hash = "home";
	},

	initialize: function() {
		Backbone.history.start()
	}

})

new EtsyRouter();

var enterTrigger = function(eventObj){
	// console.log(eventObj)
	if(eventObj.keyCode === 13) {
		console.log(eventObj.target.value)
		location.hash = "search/" + eventObj.target.value
		eventObj.target.value = ''
	}
}

document.querySelector("#searchinput").addEventListener('keydown', enterTrigger)

document.querySelector("#home").addEventListener('click', function(){
	location.hash = "home"
})


