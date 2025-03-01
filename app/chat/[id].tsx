import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { io, Socket } from 'socket.io-client';
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import Constants from "expo-constants";
import { View, ActivityIndicator } from 'react-native';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const groupId = id; // The group the user is chatting in
  const { token } = useAuth();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 1. Establish the socket connection when token or groupId changes
   */
  useEffect(() => {
    console.log("TOKEN:", token);
    const newSocket = io(API_BASE_URL, {
      transports: ["websocket"],
      query: { token },
    });

    console.log("Attempting socket connection with token:", token);
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [groupId, token]);

  /**
   * 2. Once socket is set, attach listeners
   */
  useEffect(() => {
    if (!socket) return;

    // On connect, join the group
    socket.on('connect', () => {
      console.log('Connected to socket server, socket ID:', socket.id);
      socket.emit('joinGroup', { groupId });
    });

    // Receive initial messages
    socket.on('initialMessages', (msgs) => {
      const giftedMessages = msgs.map(serverMsgToGiftedMsg);
      setMessages(giftedMessages);
      setLoading(false);
    });

    // Listen for new messages from the server
    socket.on('newMessage', (msg) => {
      setMessages((prev) => GiftedChat.append(prev, [serverMsgToGiftedMsg(msg)]));
    });

    // Error handling
    socket.on('errorMessage', (error) => {
      console.warn('Socket error:', error);
    });

    socket.on("connect_error", (err) => {
      console.log("Connection error:", err.message);
    });

    // Cleanup listeners on unmount or when socket changes
    return () => {
      socket.off('connect');
      socket.off('initialMessages');
      socket.off('newMessage');
      socket.off('errorMessage');
      socket.off('connect_error');
    };
  }, [socket, groupId]);

  /**
   * 3. Sending a message
   */
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    if (!socket || newMessages.length === 0) return;

    // We do not immediately append, relying on server's 'newMessage' event
    const [msg] = newMessages;
    socket.emit('sendMessage', {
      groupId,
      text: msg.text,
    });
  }, [socket, groupId]);

  /**
   * 4. If desired, show a basic loading spinner until initial messages load
   */
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  /**
   * 5. Render GiftedChat
   */
  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: token || 'guest',
        name: 'Demo User',
      }}
    />
  );
}

/**
 * Utility function to convert a server-side message object
 * into GiftedChat's IMessage shape.
 * Example server fields: { id, group_id, user_id, message_text, created_at, user_name }
 */
function serverMsgToGiftedMsg(serverMsg: any): IMessage {
  return {
    _id: serverMsg.id ?? Math.random().toString(36),
    text: serverMsg.message_text || serverMsg.text || '',
    createdAt: new Date(serverMsg.created_at || Date.now()),
    user: {
      _id: serverMsg.user_id || 'unknown-user',
      name: serverMsg.user_name || 'Unknown',
    },
  };
}
