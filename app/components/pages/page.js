import React from 'react';
import Relay from 'react-relay';

import PageAnimations from './PageAnimations.js';
import { AnimateItem } from '../../animations.js'

import Layouts from '../layouts/layouts.js';
import DefaultLayout from '../layouts/DefaultLayout.js';
import PostList from '../posts/PostList.js';

import CSSModules from 'react-css-modules';
import styles from './page.scss';

@CSSModules(styles, {allowMultiple:true})
class Page extends React.Component{

  _setLayout(){
    const Layout = this.props.viewer.post.layout.meta_value || 'DefaultLayout';
    const isDefault = Layout === 'DefaultLayout';
    const isPostList = Layout === 'PostList';

    this.props.relay.setVariables({
      page: this.props.page,
      isDefault: isDefault,
      isPostList: isPostList
    })
  }

  componentWillMount(){
    this._setLayout()
  }

	componentDidMount(){
		let animation = this.props.animation || PageAnimations.animateIn;
		AnimateItem(this._page, PageAnimations.animateIn);
	}

	render(){
    console.log(this.props.relay.route);
		const { viewer, className } = this.props;
    const { post } = viewer;
    const Layout = Layouts[post.layout.meta_value] || Layouts['Default'];

    return(
			<div ref={ (c) => this._page = c } className={styles.base + ' ' + className}>
        <Layout.Component
          viewer={viewer}
          page={this.props.page}
          condition={true}
          layout={Layout}
        />
			</div>
		)
	}
}

const COMPONENTS = [
  [DefaultLayout, 'isDefault'],
  [PostList, 'isPostList']
];

export default Relay.createContainer(Page, {

  initialVariables: {
    page: null,
    isDefault: false,
    isPostList: false,
  },

  prepareVariables(prevVars){
    console.log(prevVars);
    return{
      ...prevVars
    }
  },

  fragments: {
    viewer: (variables) => Relay.QL`
    fragment on User {
      ${DefaultLayout.getFragment('viewer', {page: variables.page, condition: variables.isDefault})},
      post(post_name: $page){
        id
        layout{
          id
          meta_value
        }
      },
      settings{
        id
        uploads
        amazonS3
      }
    }
    `
  }
});
