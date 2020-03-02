import React, { Component } from 'react';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Load,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static propTypes = {
    navigation: PropTypes.shape({
      setOptions: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
    route: PropTypes.shape({
      params: PropTypes.object,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    this.loadStarred();
  }

  loadStarred = async () => {
    const { page, stars } = this.state;
    const { route } = this.props;
    const { user } = route.params;

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page,
      },
    });

    this.setState({
      stars: [...stars, ...response.data],
      loading: false,
      refreshing: false,
    });
  };

  loadMore = async () => {
    const { page } = this.state;

    await this.setState({ page: page + 1 });

    this.loadStarred();
  };

  refreshList = async () => {
    this.setState({ refreshing: true, page: 1, stars: [] }, this.loadStarred);
  };

  render() {
    const { navigation, route } = this.props;
    const { user } = route.params;
    const { stars, loading, refreshing } = this.state;

    navigation.setOptions({
      title: user.name,
    });
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Load size={50} />
        ) : (
          <Stars
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            data={stars}
            keyExtractor={star => String(star.id)}
            renderItem={({ item }) => (
              <Starred
                onPress={() => navigation.navigate('Repository', { item })}
              >
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
