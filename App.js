import React, {Component, useState, useEffect} from 'react';
import * as Notifications from 'expo-notifications';
import {View, Text, ScrollView} from 'react-native';
import {Button, Image, Switch} from '@rneui/base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';
import styles from '../emqx-MQTT-Client-Examples-master-mqtt-client-React-Native-RNMQTTDemo-master/styles/style';
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});
const options = {
  host: 'm4.wqtt.ru',
  port: 5929,
  id: 'Client_id_' + parseInt(Math.random() * 100000),
};
client = new Paho.MQTT.Client(options.host, options.port, options.id);

class App extends Component {
  componentDidMount() {
    this.getNotificationPermission();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  notificationTimer = null;
  async getNotificationPermission() {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Разрешение на всплывающие уведомления не было выдано.');
      return false;
    }
    return true;
  }
  async sendLocalNotification(text) {
    const isPermissionGranted = await this.getNotificationPermission();
    if (isPermissionGranted) {
      const content = {
        title: 'IOT жүйесі:',
        body: '',
      };
      content.body = text;
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });
    }
  }
  toggleNasos1 = set => {
    this.setState({nasos1: set});
  };
  // togglewindow = set => {
  //   this.setState({window: set});
  // };
  toggleKuler = set => {
    this.setState({kuler: set});
  };
  switchKuler = () => {
    this.setState(prevState => ({kuler: !prevState.kuler}));
    var message;
    if (this.state.kuler) {
      message = new Paho.MQTT.Message('0');
    } else {
      message = new Paho.MQTT.Message('1');
    }
    message.destinationName = '/room/kuler';
    this.state.prevent = true;
    client.send(message);
  };
  switchNasos1 = () => {
    this.setState(prevState => ({nasos1: !prevState.nasos1}));
    var message;
    if (this.state.nasos1) {
      message = new Paho.MQTT.Message('0');
    } else {
      message = new Paho.MQTT.Message('1');
    }
    message.destinationName = '/room/nasos1';
    this.state.prevent = true;
    client.send(message);
  };
  // switchwindow = () => {
  //   this.setState(prevState => ({window: !prevState.window}));
  //   var message;
  //   if (this.state.window) {
  //     message = new Paho.MQTT.Message('0');
  //   } else {
  //     message = new Paho.MQTT.Message('1');
  //   }
  //   message.destinationName = '/room/window';
  //   this.state.prevent = true;
  //   client.send(message);
  // };

  constructor(props) {
    super(props);
    this.state = {
      topic: '/#',
      subscribedTopic: '/#',
      message: '',
      messageList: [],
      status: '',
      temp: '',
      hum: '',
      gaz: '',
      water: '',
      nasos1: '',
      door: '',
      opasnost: '',
      kuler: '',
      dvizh: '',
      prevent: false,
    };
    client.onConnectionLost = this.onConnectionLost;
    client.onMessageArrived = this.onMessageArrived;
  }
  //байланыс сатты болганда
  onConnect = () => {
    console.log('onConnect', this.state.subscribedTopic);
    client.subscribe('/#', {qos: 0});
    this.setState({status: 'connected'});
  };
  // байланыс сатсыз болганда
  onFailure = err => {
    console.log('Connect failed!');
    console.log(err);
    this.setState({status: 'failed'});
  };
  // MQTT ГА БАЙЛАНЫС
  connect = () => {
    this.setState({status: 'isFetching'}, () => {
      client.connect({
        onSuccess: this.onConnect,
        timeout: 10,
        mqttVersion: 4,
        userName: 'prog',
        password: 'prog',
        useSSL: true,
        onFailure: this.onFailure,
      });
    });
    // this.subscribeTopic();
  };
  // байланыс узылгенде
  onConnectionLost = responseObject => {
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  };
  //подписка жасалган топикка сообщение келсе
  temp35 = false;
  onMessageArrived = message => {
    console.log('onMessageArrived:' + message.payloadString);
    console.log('onMessageArrivedDEST:' + message.destinationName);
    if (message.destinationName == '/room/opasnost') {
      if (message.payloadString === 'УТЕЧКА ГАЗА!!!') {
        this.setState({opasnost: message.payloadString, kuler: true});
        this.sendLocalNotification("Газ мөлшері көбейді!!!");
      } else if (message.payloadString === '') {
        this.setState({opasnost: '', kuler: false});
      }
    } else if (message.destinationName == '/room/gaz') {
      this.setState({gaz: message.payloadString});
    } else if (message.destinationName == '/room/temp') {
      this.setState({temp: message.payloadString});
      if(parseInt(message.payloadString)>35 && temp35 == false){
        this.sendLocalNotification("Температура 35 градустан асты!!!");
        temp35=true;
      }else{
        temp35=false;
      }
    } else if (message.destinationName == '/room/humidity') {
      this.setState({hum: message.payloadString});
    } else if (message.destinationName == '/room/water') {
      this.setState({water: message.payloadString});
      this.sendLocalNotification("Су ағып тұр!!!");
    } else if (message.destinationName == '/room/nasos1') {
      if (this.state.prevent) {
        this.state.prevent = false;
        return;
      }
      if (message.payloadString === '1') {
        this.toggleNasos1(true);
      } else if (message.payloadString === '0') {
        this.toggleNasos1(false);
      }
    } else if (message.destinationName == '/room/door') {
      if (message.payloadString === '1') {
        this.setState({door: 'жабық'});
      } else if (message.payloadString === '0') {
        this.setState({door: 'ашық'});
        this.sendLocalNotification("Есік ашылды!!!");
      }
    } else if (message.destinationName == '/room/kuler') {
      if (this.state.prevent) {
        this.state.prevent = false;
        return;
      }
      if (message.payloadString === '1') {
        this.toggleKuler(true);
      } else if (message.payloadString === '0') {
        this.toggleKuler(false);
      }
    }else if (message.destinationName == '/room/dvizh'){
      if (message.payloadString === '1') {
        this.setState({dvizh: 'бар'});
      } else if (message.payloadString === '0') {
        this.setState({dvizh: 'жоқ'});
      }
    }
  };
  onChangeTopic = text => {
    this.setState({topic: text});
  };
  // Топикка подписка
  subscribeTopic = () => {
    client.subscribe(this.state.subscribedTopic, {qos: 0});
    // this.setState({subscribedTopic: '/#'}, () => {
    // });
  };
  // Топиктан отписка
  unSubscribeTopic = () => {
    client.unsubscribe(this.state.subscribedTopic);
    this.setState({subscribedTopic: '/#'});
  };
  onChangeMessage = text => {
    this.setState({message: text});
  };
  // хабарлама жыберу
  sendMessage = () => {
    var message = new Paho.MQTT.Message(options.id + ':' + this.state.message);
    message.destinationName = this.state.subscribedTopic;
    client.send(message);
  };
  renderRow = ({item, index}) => {
    let idMessage = item.split(':');
    console.log('>>>ITEM', item);
    return (
      <View
        style={[
          styles.componentMessage,
          idMessage[0] == options.id
            ? styles.myMessageComponent
            : idMessage.length == 1
            ? styles.introMessage
            : styles.messageComponent,
        ]}>
        <Text
          style={idMessage.length == 1 ? styles.textIntro : styles.textMessage}>
          {item}
        </Text>
      </View>
    );
  };
  _keyExtractor = (item, index) => item + index;
  render() {
    const {status} = this.state;
    const {isEnabled} = this.state;
    return (
      <ScrollView style={styles.container}>
        <Text
          style={{
            marginBottom: 50,
            textAlign: 'center',
            color: this.state.status === 'connected' ? 'green' : 'black',
          }}>
          ClientID: {options.id}
        </Text>
        {this.state.status == 'connected' ? (
          <></>
        ) : (
          <Text style={styles.JASIK}>JASIK_IOT_KAZNU</Text>
        )}
        {this.state.status === 'connected' ? (
          <View>
            <Button
              type="solid"
              title="ШЫҒУ"
              onPress={() => {
                client.disconnect();
                this.setState({status: '', subscribedTopic: '/#'});
              }}
              buttonStyle={{marginBottom: 50, backgroundColor: '#397af8'}}
            />
            {/* <View style={{marginBottom: 30, alignItems: 'center'}}>
              <Input
                label="TOPIC"
                placeholder=""
                value={this.state.topic}
                onChangeText={this.onChangeTopic}
                disabled={this.state.subscribedTopic}
              />
              {this.state.subscribedTopic ? (
                <Button
                  type="solid"
                  title="UNSUBSCRIBE"
                  onPress={this.unSubscribeTopic}
                  buttonStyle={{backgroundColor: '#397af8'}}
                />
              ) : (
                <Button
                  type="solid"
                  title="SUBSCRIBE"
                  onPress={this.subscribeTopic}
                  buttonStyle={{backgroundColor: '#397af8'}}
                  disabled={
                    !this.state.topic || this.state.topic.match(/ /)
                      ? true
                      : false
                  }
                />
              )}
            </View> */}
          </View>
        ) : (
          <Button
            type="solid"
            title="ҚОСЫЛУ"
            onPress={this.connect}
            buttonStyle={{
              marginBottom: 50,
              alignItems: 'center',
              backgroundColor: status === 'failed' ? 'red' : '#397af8',
            }}
            loading={status === 'isFetching' ? true : false}
            disabled={status === 'isFetching' ? true : false}
          />
        )}
        {this.state.status == 'connected' ? (
          <View style={styles.block}>
            <View style={styles.row}>
              <Image
                style={styles.tinyLogo}
                source={{
                  uri: 'https://thumbs.dreamstime.com/b/%D0%B7%D0%BD%D0%B0%D1%87%D0%BE%D0%BA-%D1%82%D0%B5%D1%80%D0%BC%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%BE%D0%BC-%D0%B8%D0%BB%D0%B8-%D1%82%D0%B5%D0%BC%D0%BF%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D1%8B-%D0%B2%D0%BE%D0%B7%D0%B4%D1%83%D1%85%D0%B0-%D0%B4%D0%BB%D1%8F-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B0%D0%B4%D0%B0%D0%BF%D1%82%D0%B0%D1%86%D0%B8%D0%B8-174408917.jpg',
                }}
              />
              <Text style={{fontSize: 16}}>
                Температура:{this.state.temp}*C
              </Text>
            </View>
            <View style={styles.row}>
              <Image
                style={styles.tinyLogo}
                source={{
                  uri: 'https://is5-ssl.mzstatic.com/image/thumb/Purple123/v4/d2/44/58/d2445855-b364-6366-e5e3-99da42fa7148/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-85-220.png/1200x630wa.png',
                }}
              />
              <Text style={{fontSize: 16}}>Ылғалдылық:{this.state.hum}%</Text>
            </View>

            <View style={styles.row}>
              <Image
                style={styles.tinyLogo}
                source={{
                  uri: 'https://play-lh.googleusercontent.com/K77ncfyKIKSoCxVWQ4LNGzKF3UaMxc3IRmiYIyBdEzAtZN1VLqItZAlRP3ezcNxRgeQ',
                }}
              />
              <Text style={{fontSize: 16}}>Газ:{this.state.gaz}%</Text>
            </View>
            <View style={styles.row}>
              <Image
                style={styles.tinyLogo}
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/383/383813.png',
                }}
              />
              <Text style={{fontSize: 16}}>Судың ағуы:{this.state.water}</Text>
            </View>
            <View style={styles.row}>
              <Image
                style={styles.tinyLogo}
                source={{
                  uri: 'https://o.remove.bg/uploads/e84f8111-016d-4558-bf79-b04156f134b2/1190078.png',
                }}
              />
              <Text style={{fontSize: 16}}>Есік: {this.state.door}</Text>
            </View>
            <View style={styles.row}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Image
                  style={styles.tinyLogo}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/1037/1037489.png',
                  }}
                />
                <Switch
                  style={styles.Switch}
                  trackColor={{false: '#f4f3f4', true: '#25c425'}}
                  thumbColor={this.state.nasos1 ? '#f4f3f4' : '#f4f3f4'}
                  ios_backgroundColor="#f4f3f4"
                  onValueChange={this.switchNasos1}
                  value={this.state.nasos1}
                />
              </View>
              <Text style={{fontSize: 16}}>Сорғы:</Text>
            </View>
            <View style={styles.row}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Image
                  style={styles.tinyLogo}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/7137/7137956.png',
                  }}
                />
                <Switch
                  style={styles.Switch}
                  trackColor={{false: '#f4f3f4', true: '#25c425'}}
                  thumbColor={this.state.kuler ? '#f4f3f4' : '#f4f3f4'}
                  ios_backgroundColor="#f4f3f4"
                  onValueChange={this.switchKuler}
                  value={this.state.kuler}
                />
              </View>
              <Text style={{fontSize: 16}}>Салқындатқыш:</Text>
            </View>
            <View style={styles.row}>
              <Image
                style={styles.tinyLogo}
                source={{
                  uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2LnPIewyJmZoNWkuEDs_2s9-5rGVh5xWuFA&usqp=CAU',
                }}
              />
              <Text style={{fontSize: 16}}>Қозғалыс: {this.state.dvizh}</Text>
            </View>
            {/* <View style={styles.row}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Image
                  style={styles.tinyLogo}
                  source={{
                    uri: 'https://w7.pngwing.com/pngs/169/912/png-transparent-window-computer-icons-window-blue-angle-furniture.png',
                  }}
                />
                <Switch
                  style={styles.Switch}
                  trackColor={{false: '#f4f3f4', true: '#25c425'}}
                  thumbColor={this.state.window ? '#f4f3f4' : '#f4f3f4'}
                  ios_backgroundColor="#f4f3f4"
                  onValueChange={this.switchwindow}
                  value={this.state.window}
                />
              </View>
              <Text style={{fontSize: 16}}>Терезе:</Text>
            </View> */}
          </View>
        ) : (
          <></>
        )}
      </ScrollView>
    );
  }
}

export default App;
