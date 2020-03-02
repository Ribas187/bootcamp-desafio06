import React from 'react';
import PropTypes from 'prop-types';
import { WebView } from 'react-native-webview';

export default function Repository({ navigation, route }) {
  const { item } = route.params;

  navigation.setOptions({
    title: item.name,
  });

  console.tron.log(item.html_url);

  return <WebView source={{ uri: item.html_url }} style={{ flex: 1 }} />;
}

Repository.propTypes = {
  navigation: PropTypes.shape({
    setOptions: PropTypes.func,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.object,
  }).isRequired,
};
