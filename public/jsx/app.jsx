
//Iterate over the array, sorting each film by the requested 
let sortArrayBy = function(sortCategory, isAscending, arr) {
	console.log(arguments);
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
	// } else {
	// 	arr.sort(function(a, b) {
	// 		return (a[sortCategory] > b[sortCategory]) ? a[sortCategory] : b[sortCategory];
	// 	});
	}

	return arr;
};

let applyFilters = function(filtersApplied, arr) {
	return arr;
};
			
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
	
	//called only once
	componentDidMount: function() {
		//send off a get request which receives the json film data
		fetch(this.props.dataURL)
			.then( (response) => {
				return response.json() })   
					.then( (json) => {
						//trigger a render with the prepared film list
						this.setState({filmList: json, jsonReceived: true});
						
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
		films = applyFilters(this.props.filtersApplied, films);
		return (
			<div>
				<ul id="filmList">
				{/* iterate over the films array, creating a single Film component for each */}
					{films.map(function(film) {
						return <li key={film.id}> <Film filmInfo={film} /> </li>;
					})}
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
		
		
		return (
			<p className="filmTitle">{filmInfo.title} ({filmInfo.release_date}) {filmInfo.rt_score}%</p>
			
		)}
		
	});
	
	
ReactDOM.render(
	<FilmList dataURL="/films" sortBy="title" isAscending={true} />,
	document.getElementById('app')
);





