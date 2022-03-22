import { Layout, Menu } from "antd";
import React from "react";
import { Link } from "react-router-dom";

const { Item } = Menu;

class BasicLayout extends React.Component {
  render() {
    return (
      <>
        <Layout>
          <Layout.Header>
            <Menu theme="dark" mode="horizontal" >
              <Item key="1">
                <span><Link to="snow"></Link>Snow</span>
              </Item>
              <Item key="2">
                <span><Link to="transform"></Link>Transfer</span>
              </Item>
            </Menu>
          </Layout.Header>
          <Layout.Content>{this.props.children}</Layout.Content>
        </Layout>
      </>
    );
  }
}

export default BasicLayout;
