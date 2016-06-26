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
			htmlString += '<div data-id="' + listingsArray[i].attributes.listing_id + '" class="item-box">'
			htmlString += '<h3>' + listingsArray[i].attributes.title + '...</h3>'
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
		var singleId = eventObj.target.getAttribute('data-id')
		console.log(singleId)
		location.hash = "detail/" + singleId
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
		var singleItemRender = "<div><img src='" + singleListingBase.Images[0].url_570xN + "'><p>" + singleListingBase.description + "</p></div>"

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


