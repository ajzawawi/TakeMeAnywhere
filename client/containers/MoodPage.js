import React from 'react';
import MoodPageEntry from '../pages/Mood/MoodPageEntry.js';
  //connects this props and state in reducer
import { connect } from 'react-redux';
  //importing the action creator
import { moodSelector } from '../actions/index';
  //binds action creator to MoodPage
import { bindActionCreators } from 'redux';

class MoodPage extends React.Component {
  constructor(props) {
    super(props);
    this.onMoodClick = this.onMoodClick.bind(this);
  }

  onMoodClick(mood) {
    this.props.moodSelector(mood);
    window.location.hash ='#/about';
  }

  render() {
    console.log(this.props.moods)
    return (
      <div>
        {this.props.moods.map((mood, i) =>
          <MoodPageEntry
            onMoodClick={() => this.onMoodClick(mood)}
            key={i}
            moods={mood} />
        )}
      </div>
    )
  }

}


//moodData will now be available as props in MoodPage class
function mapStateToProps(state) {
  return {
    moods: state.moods
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({moodSelector: moodSelector}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MoodPage);


