//Iterate over the array, sorting each film by the requested
let sortArrayBy = function(sortCategory, isAscending, arr) {

	//true if alphabetical/increasing in value is requested
	if (isAscending) {
		arr.sort(function(a,b) {
			if (a[sortCategory] < b[sortCategory]) {
				return -1;
			}
			if (a[sortCategory] > b[sortCategory]) {
				return 1;
			}
			return 0;
		});

	} else {
		arr.sort(function(a,b) {
			if (a[sortCategory] > b[sortCategory]) {
				return -1;
			}
			if (a[sortCategory] < b[sortCategory]) {
				return 1;
			}
			return 0;
		});
	}

	return arr;
};

/*
	The parent component surrounding all of the components within the page
	This component is the first to rendered straight to index.htm by the ReactDOM
*/
let ContentContainer = React.createClass({

	
	getInitialState() {
    return {
			modalVisible: false,
			filmDisplayed: null, //which film is listed within the modal
			completeFilmList: null, //the raw untouched film list as it was when received
			isAscending: true,
			sortBy: "title",
			filter: {
				"title": true,
				"year": true,
				"rtScore": true
			},
    };
	},
	
	//toggles whether the modal window containing film information is visible or not
	toggleModal: function(setTo) {
		//this function can operate as a toggle, or have a predefined action
		if (typeof setTo !== 'boolean') {
			setTo = !this.state.modalVisible;
		}
		this.setState({modalVisible: setTo});
	},

	receiveFilmList: function(newFilmList) {
		this.setState({completeFilmList: newFilmList});
	},

	getFilmFromId: function(filmId) {
		for (let i=0; i < this.state.completeFilmList.length; i++) {
			if (this.state.completeFilmList[i].id === filmId) {
				return this.state.completeFilmList[i];
			}
		}
		console.error("selected film not found in film list");
	},

	//find the film within the film catalogue, using the ID as an identifier
	filmSelected: function(newFilm) {
		//the ID of each film is stored within the element itself, so that we can identify which film was clicked by checking the dataset of the event's target
		var selectedFilm = this.getFilmFromId(newFilm.currentTarget.dataset.filmid);
		// console.log("selectedFilm is:");
		// console.log(selectedFilm); 
		
		this.setState({filmDisplayed: selectedFilm});
		this.toggleModal(true);
	},

  //alternate whether the list is ordered by ascending or descending 
	updateListOrder: function(checked){
		this.setState({isAscending: checked});
	},

	//update which property the list is being ordered by
	updateSortProperty: function(sortProp) {
		this.setState({sortBy: sortProp});
	},

	updateListFilters: function(updatedFilter, value) {
		//first create a copy of the state's object to be modified, before overwriting it with the setState function
		let filterList = Object.assign({}, this.state.filter);
		filterList[updatedFilter] = value;
		this.setState({filter: filterList});
	

	},

	render: function(){
		return (
			<div id="reactContent">
				<Title />
				<FilmController onOrderUpdate={this.updateListOrder} onSortUpdate={this.updateSortProperty} onFilterUpdate={this.updateListFilters}/>
				<FilmList dataURL={this.props.dataURL} filtersApplied={this.state.filter} sortBy={this.state.sortBy} isAscending={this.state.isAscending} onClick={this.filmSelected} storeFilmList={this.receiveFilmList} />,
				<ModalWindow isVisible={this.state.modalVisible} filmDisplayed={this.state.filmDisplayed} closeWindow={this.toggleModal} />
			</div>
		);
	}
});

/*
provides controls which modify the list on the fly
callbacks provided by the parent component allow filter changes to be passed back and applied to the FilmList component
*/
let FilmController = React.createClass({

	//helper function to retrieve to necessary data 
	updateSortBy: function(event) {
		//get the newly selected properties sortID which is stored within the selected elements dataset
		let sortID = event.currentTarget[event.currentTarget.selectedIndex].dataset.sortBy
		this.props.onSortUpdate(sortID);
	},

	updateAscending: function(event) {
		this.props.onOrderUpdate(event.currentTarget.checked);
	},

	//work out which filter is changed, and inform the parent component for a rerender
	updateFilter: function(event) {
		this.props.onFilterUpdate(event.currentTarget.dataset.filterid, event.currentTarget.checked);
	},

	render: function(){
		return (
			<div id="filmController">
				<p className="subheading">Filters </p> 
				<br/>



				<input id="filterTitle" type="checkbox" data-filterid="title" onClick={this.updateFilter} defaultChecked></input>
				<label className="filterText" htmlFor="filterTitle">Title </label>
				<br/>
				<input id="filterYear" type="checkbox" data-filterid="year" onClick={this.updateFilter} defaultChecked></input>
				<label className="filterText" htmlFor="filterYear">Year </label>
				<br/>
				<input id="filterScore" type="checkbox" data-filterid="rtScore" onClick={this.updateFilter} defaultChecked></input>
				<label className="filterText" htmlFor="filterScore">Score (Rotten Tomatoes) </label>
				<br/>
				<br/>

				{/*when a new item is selected, change the list to be ordered by the selected item*/}
				<p className="subheading">Sort By</p> 
				<br/>
				{/*When the check box is altered, the list will toggle between ascending/descending*/}
				<select onChange={this.updateSortBy} id="sortBySelect">
					<option data-sort-by="title">Title</option> 
					<option data-sort-by="year">Release Year</option>
					<option data-sort-by="rtScore">Rotten Tomatoes Score</option>
				</select>
				<input id="ascendingCheckbox" type="checkbox" onClick={this.updateAscending} defaultChecked></input>
				<label className="filterText" htmlFor="ascendingCheckbox">Ascending </label>
				

			</div>
		);
	}
});

let Title = React.createClass({
	render: function() {
		return (
			<p className="heroHeading">Film Catalogue</p>
		)
	}
})
			
/*
	The parent container holding the list of films
	As options are updated such as filters, ascending or descending, the child Film components are rendered with the corresponding filters
*/
let FilmList = React.createClass({
	
	getInitialState() {
    return {
      jsonReceived: false,
    };
  },

  processFilmList: function(filmData) {
	  // console.log("raw film data:");
		// console.log(filmData);
		let parsedFilmList = [];
		for (let film in filmData) {
			parsedFilmList.push ({
				'id': filmData[film].id,
				'title': filmData[film].title,
				'year': Number([filmData[film].release_date]), //with the year and percentage as a number,
				'rtScore': Number([filmData[film].rt_score]),   //it becomes much more compatible with the sort algorithm
				'description': filmData[film].description,
				'director': filmData[film].director,
				'producer': filmData[film].producer
				
			});
			//return the full film list and all properties back to the parent object, so it can be manipulated by the modal container
			this.props.storeFilmList(parsedFilmList);
	}
	//trigger a render with the prepared film list
	this.setState({filmList: parsedFilmList, jsonReceived: true});
  },
	
  //called only once
  componentDidMount: function() {
	//send off a get request which receives the json film data
	fetch(this.props.dataURL)
		.then( (response) => {
			return response.json() })   
				.then( (json) => {
					this.processFilmList(json);
				});
  },


	render: function() {
		//only allow the render function to complete when the json is in
		if (!this.state.jsonReceived) {
			//retun null or false to tell react that you don't want anything rendered
			return false;
		}
		
		//passes the film array (by value, not reference!) to be sorted, leaving the original array intact for future use
		let films = sortArrayBy(this.props.sortBy, this.props.isAscending, this.state.filmList.slice(0));
		return (
				<div id="filmList" className="square-container">
				
				
				{/* iterate over the films array, creating a single Film component for each available film*/}
					{films.map(function(film) {
						return <div className="square" data-filmid={film.id} key={film.id} onClick={this.props.onClick}> 
							<Film filmInfo={film} filtersApplied={this.props.filtersApplied} /> 
						</div>;
					}, this)}
			</div>
		);
	}
});

/*
	Individual film component
	This is passed the info which is to be shown, which changes as filters are selected
	A callback to various mouse events is provided to allow the user to click individual titles to see more info
*/
let Film = React.createClass({
	render: function() {
		const filmInfo = this.props.filmInfo;

		// An object containing booleans stating whether each data value is required
		let displayTitle = this.props.filtersApplied.title;
		let displayYear = this.props.filtersApplied.year;
		let displayScore = this.props.filtersApplied.rtScore;

		return (
			<div className="filmSquare content">
				<p className="filmSquareTitle">{displayTitle ? filmInfo.title : ''}</p> <br />
				{displayYear ? filmInfo.year : ''} <br />
				{displayScore ? filmInfo.rtScore+'%' : ''}
			</div>
		)
	}
});

let ModalWindow = React.createClass({
	render: function() {
		//show/hide the div upon re-renders by toggling the style between display and none
		let visibility = this.props.isVisible ? 'block' : 'none';
		//if this is rendering without an available film to display, cancel
		if (!this.props.filmDisplayed) {
			return null;
		}
		// console.log(this.props.filmDisplayed);
		return (
			<div id="modalWindow" style={{display: visibility}}> 
				<a href="#" onClick={this.props.closeWindow} className="close"></a>
				<p className="modalHeading">{this.props.filmDisplayed.title}</p>
				<h3>{this.props.filmDisplayed.description}</h3>
				<h2>Released {this.props.filmDisplayed.year}</h2>
				<h2>Rotten Tomatoes {this.props.filmDisplayed.rtScore}%</h2>
				<h3>Directed by {this.props.filmDisplayed.director}</h3>
				<h3>Produced by {this.props.filmDisplayed.producer}</h3>
			</div>
		)
	}
})
	
	// Attach the .jsx content to the empty div titled 'app', and kick off the initial component render
ReactDOM.render(
	<ContentContainer dataURL="/films"/>,
	document.getElementById('app')
);
