import React, { Component } from "react";
import { Button ,Icon ,Text } from "native-base";
import { connect } from "react-redux";
import { View } from "react-native";
import { addComponent, removeComponent, watchComponent, updateQuery, setQueryOptions } from "../actions";
import { isEqual, getQueryOptions, pushToAndClause } from "../utils/helper";


class NumberBoxCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			currentValue:this.props.defaultSelected||0,
			options: []
		};
		this.type = "Term";
		this.internalComponent = this.props.componentId + "__internal";
	}

	componentDidMount() {
		this.props.addComponent(this.internalComponent);
		this.props.addComponent(this.props.componentId);
		this.setReact(this.props);

		const queryOptions = getQueryOptions(this.props);
		queryOptions.aggs = {
			[this.props.dataField]: {
				terms: {
					field: this.props.dataField,
					size: 100,
					order: {
						_count: "desc"
					}
				}
			}
		}
		//this.props.setQueryOptions(this.internalComponent, queryOptions);
		//this.props.updateQuery(this.internalComponent, null);
	}

	/*componentWillReceiveProps(nextProps) {
		if (!isEqual(nextProps.react, this.props.react)) {
			this.setReact(nextProps);
		}
		if (!isEqual(nextProps.options, this.props.options)) {
			this.setState({
				options: nextProps.options[nextProps.dataField].buckets || []
			});
		}
	}
*/
	componentWillUnmount() {
		this.props.removeComponent(this.props.componentId);
		this.props.removeComponent(this.internalComponent);
	}

	setReact(props) {
		const { react } = props;
		if (react) {
			newReact = pushToAndClause(react, this.internalComponent);
			props.watchComponent(props.componentId, newReact);
		} else {
			props.watchComponent(props.componentId, { and: this.internalComponent });
		}
	}

	defaultQuery(value) {
		if (this.selectAll) {
			return {
				exists: {
					field: [this.props.dataField]
				}
			};
		} else if (value) {
			return {
				[this.type]: {
					[this.props.dataField]: value
				}
			};
		}
	}

	setValue = (value) => {
		this.setState({
			currentValue: value
		});
		//this.props.updateQuery(this.props.componentId, this.defaultQuery(value))
	};

	render() {
		return (
			<View style={{ flexDirection:"row",paddingVertical:10,alignItem:"center" }}>
				<Text style={{ alignSelf:"center",padding:10 }}>{this.props.label}</Text>
				<Button light onPress={()=>this.setValue(this.state.currentValue-1)}>
					<Icon name='md-remove' />
				</Button>
				<Text style={{ alignSelf:"center",padding:10 }}>{this.state.currentValue}</Text>
				<Button light disabled onPress={()=>this.setValue(this.state.currentValue+1)}>
					<Icon name='md-add' />
				</Button>
			</View>
			
		);
	}
}

NumberBoxCard.defaultProps = {
	queryFormat:"gte",
	showFilter:true,
	//filterLabel:this.props.componentId,
	URLParams:false
}

const mapStateToProps = (state, props) => ({
	options: state.aggregations[props.componentId]
});

const mapDispatchtoProps = dispatch => ({
	addComponent: component => dispatch(addComponent(component)),
	removeComponent: component => dispatch(removeComponent(component)),
	watchComponent: (component, react) => dispatch(watchComponent(component, react))
	//updateQuery: (component, query) => dispatch(updateQuery(component, query)),
	//setQueryOptions: (component, props) => dispatch(setQueryOptions(component, props))
});

export default connect(mapStateToProps, mapDispatchtoProps)(NumberBoxCard);
