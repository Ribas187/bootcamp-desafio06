import React, { Component } from 'react';
import { Keyboard, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
} from './styles';

export default class Main extends Component {
  state = {
    newUser: '',
    users: [],
    loading: false,
    error: false,
  };

  static propTypes = {
    navigation: PropTypes.shape({
      setOptions: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    this.setState({ loading: true, error: false });

    try {
      const { users, newUser } = this.state;

      if (newUser === '') {
        throw new Error('Você precisa indicar um usuário');
      }

      const duplicated = users.find(r => r.login === newUser);

      if (duplicated) {
        throw new Error('Usuário duplicado');
      }

      const response = await api.get(`/users/${newUser}`);

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };

      this.setState({
        users: [...users, data],
        newUser: '',
      });
    } catch (error) {
      if (error.message === 'Request failed with status code 404') {
        Alert.alert('Aviso', 'Usuário não encontrado.');
      } else {
        Alert.alert('Aviso', error.message);
      }
      this.setState({ error: true });
    } finally {
      this.setState({ loading: false });
    }

    Keyboard.dismiss();
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  render() {
    const { navigation } = this.props;
    const { users, newUser, loading, error } = this.state;

    navigation.setOptions({
      title: 'Usuários',
    });

    return (
      <Container>
        <Form>
          <Input
            error={error}
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar Usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />

          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>

              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver Perfil</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
