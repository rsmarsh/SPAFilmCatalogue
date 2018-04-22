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

let applyFilters = function(filtersApplied, arr) {
	console.log("rendering, applying the following filters:");
	console.log(filtersApplied);
	console.log(arr);
	return arr;
};

/*
	The parent component surrounding all of the components within the page
	This component is the first to rendered straight to index.htm by the ReactDOM
*/
let ContentContainer = React.createClass({

	
	getInitialState() {
    return {
			isAscending: false,
			sortBy: "title",
			filter: {
				"title": true,
				"year": true,
				"rtScore": true
			},
    };
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
		//create a copy of the state's object to be modified, before overwriting it with the setState function
		let filterList = Object.assign({}, this.state.filter);
		filterList[updatedFilter] = value;
		this.setState({filter: filterList});
	

	},

	render: function(){
		return (
			<div id="reactContent">
				<FilmController onOrderUpdate={this.updateListOrder} onSortUpdate={this.updateSortProperty} onFilterUpdate={this.updateListFilters}/>
				<FilmList dataURL={this.props.dataURL} filtersApplied={this.state.filter} sortBy={this.state.sortBy} isAscending={this.state.isAscending} />,
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
			<div>Sort By 
				{/*when a new item is selected, change the list to be ordered by the selected item*/}
				<select onChange={this.updateSortBy} id="sortBySelect">
					<option data-sort-by="title">Title</option>
					<option data-sort-by="year">Release Year</option>
					<option data-sort-by="rtScore">Rotten Tomatoes Score</option>
				</select>

				{/*When the check box is altered, the list will toggle between ascending/descending*/}
				<label className="filmTitle" htmlFor="ascendingCheckbox">Ascending </label>
				<input id="ascendingCheckbox" type="checkbox" onClick={this.updateAscending}></input>

				<h2>Filters: </h2> 

				<label className="filmTitle" htmlFor="filterTitle">Title </label>
				<input id="filterTitle" type="checkbox" data-filterid="title" onClick={this.updateFilter} defaultChecked></input>

				<label className="filmTitle" htmlFor="filterYear">Year </label>
				<input id="filterYear" type="checkbox" data-filterid="year" onClick={this.updateFilter} defaultChecked></input>

				<label className="filmTitle" htmlFor="filterScore">Rotten Tomatoes Score </label>
				<input id="filterScore" type="checkbox" data-filterid="rtScore" onClick={this.updateFilter} defaultChecked></input>

			</div>
		);
	}
});


			
/*
	The parent container holding the list of films
	As options are updated such as filters, ascending or descending, the child Film components are rendered with the corresponding filters
*/
let FilmList = React.createClass({
	
	getInitialState() {
    return {
      jsonReceived: false
    };
  },

  processFilmList: function(filmData) {
	  console.log("raw film data:");
	  console.log(filmData);
	let parsedFilmList = [];
	for (let film in filmData) {
		parsedFilmList.push ({
			'id': filmData[film].id,
			'title': filmData[film].title,
			'year': Number([filmData[film].release_date]), //with the year and percentage as a number,
			'rtScore': Number([filmData[film].rt_score])   //it becomes much more compatible with the sort algorithm
		});
	}
	console.log(parsedFilmList);
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
		// films = applyFilters(this.props.filtersApplied, films);
		return (
			<div>
				<ul id="filmList">
				{/* iterate over the films array, creating a single Film component for each available film*/}
					{films.map(function(film) {
						return <li key={film.id}> <Film filmInfo={film} filtersApplied={this.props.filtersApplied} /> </li>;
					}, this)}
				</ul>
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
			<p className="filmTitle">
				{displayTitle ? filmInfo.title : ''} 
				{displayYear ? ' ('+filmInfo.year+')' : ''}
				{displayScore ? ' '+filmInfo.rtScore+'%' : ''}
			</p>
		)
	}
});
	
	
ReactDOM.render(
	<ContentContainer dataURL="/films"/>,
	document.getElementById('app')
);




