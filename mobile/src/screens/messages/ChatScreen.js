import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../context/AuthContext';
import { UnreadContext } from '../../context/UnreadContext';
import { conversationApi } from '../../services/api';
import { colors, fonts } from '../../theme';
import StackScrollGuard from '../../components/StackScrollGuard';
import useStackHeaderInset from '../../components/useStackHeaderInset';

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dayLabel = (value) => {
  const date = new Date(value);
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const diff = Math.round((today - day) / 86400000);
  if (diff === 0) {
    return "Aujourd'hui";
  }
  if (diff === 1) {
    return 'Hier';
  }
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  if (date.getFullYear() !== today.getFullYear()) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('fr-FR', options);
};

const timeLabel = (value) =>
  new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const TWO_MINUTES = 2 * 60 * 1000;

const withDaySeparators = (messages) => {
  const rows = [];
  let lastDay = '';
  let lastShownTime = '';

  messages.forEach((message, index) => {
    const day = startOfDay(new Date(message.created_at)).toISOString();
    if (day !== lastDay) {
      rows.push({ kind: 'day', id: `day-${day}`, label: dayLabel(message.created_at) });
      lastDay = day;
      lastShownTime = '';
    }

    const next = messages[index + 1];
    const sameSender = next && Number(next.sender_user_id) === Number(message.sender_user_id);
    const gap = next ? new Date(next.created_at) - new Date(message.created_at) : Infinity;
    const nextDay = next ? startOfDay(new Date(next.created_at)).toISOString() : '';
    const endOfRun = !sameSender || gap > TWO_MINUTES || nextDay !== day;
    let sentAt = '';
    if (endOfRun) {
      const label = timeLabel(message.created_at);
      if (label !== lastShownTime) {
        sentAt = label;
        lastShownTime = label;
      }
    }

    rows.push({ kind: 'message', id: String(message.id), message, sentAt });
  });
  return rows;
};

export default function ChatScreen({ route }) {
  const topInset = useStackHeaderInset();
  const { conversationId } = route.params;
  const { currentUser } = useContext(AuthContext);
  const { refreshUnread } = useContext(UnreadContext) || {};
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [pinToComposer, setPinToComposer] = useState(true);
  const listRef = useRef(null);
  const listHeight = useRef(0);
  const stickToLatest = useRef(true);

  const loadMessages = useCallback(async () => {
    try {
      const data = await conversationApi.listMessages(conversationId);
      setMessages(data);
      setError('');
      if (refreshUnread) {
        refreshUnread();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId, refreshUnread]);

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [loadMessages])
  );

  useEffect(() => {
    const timer = setInterval(loadMessages, 4000);
    return () => clearInterval(timer);
  }, [loadMessages]);

  const onSend = async () => {
    const text = content.trim();
    if (!text) {
      return;
    }
    setSending(true);
    stickToLatest.current = true;
    try {
      await conversationApi.sendMessage(conversationId, text);
      setContent('');
      await loadMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!stickToLatest.current) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages]);

  const lastSeenId = [...messages]
    .reverse()
    .find((message) => Number(message.sender_user_id) === Number(currentUser?.id) && message.seen)?.id;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator accessibilityLabel="Chargement des messages" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { paddingTop: topInset }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StackScrollGuard />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        ref={listRef}
        style={styles.listView}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 0, bottom: 0, left: 0, right: 0 }}
        data={withDaySeparators(messages)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, pinToComposer && styles.listPinned]}
        onLayout={(event) => {
          listHeight.current = event.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_width, height) => {
          if (!listHeight.current) {
            return;
          }
          const fits = height <= listHeight.current;
          setPinToComposer((current) => (current === fits ? current : fits));
          if (stickToLatest.current) {
            listRef.current?.scrollToEnd({ animated: false });
          }
        }}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
          stickToLatest.current = distanceFromBottom < 80;
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          if (item.kind === 'day') {
            return <Text style={styles.day}>{item.label}</Text>;
          }
          const mine = Number(item.message.sender_user_id) === Number(currentUser?.id);
          const showSeen = mine && item.message.id === lastSeenId;
          const meta = [item.sentAt, showSeen ? 'Vu' : ''].filter(Boolean).join(' · ');
          return (
            <View style={styles.messageBlock}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={mine ? styles.bubbleTextMine : styles.bubbleText}>{item.message.content}</Text>
              </View>
              {meta ? (
                <Text
                  style={[styles.time, mine ? styles.timeMine : styles.timeOther]}
                  accessibilityLabel={showSeen ? `${item.sentAt || 'Message'} vu` : `Envoyé à ${item.sentAt}`}
                >
                  {meta}
                </Text>
              ) : null}
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="Écrire un message"
          accessibilityLabel="Message"
        />
        <Pressable
          style={[styles.send, sending && styles.sendBusy]}
          onPress={onSend}
          disabled={sending}
          accessibilityRole="button"
          accessibilityLabel="Envoyer"
        >
          <Ionicons name="paper-plane" size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  listView: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { padding: 16, gap: 8 },
  listPinned: { flexGrow: 1, justifyContent: 'flex-end' },
  day: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    color: colors.muted,
    fontFamily: fonts.sansMed,
    fontSize: 13,
    textTransform: 'capitalize'
  },
  messageBlock: { width: '100%', gap: 2 },
  time: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11 },
  timeMine: { alignSelf: 'flex-end' },
  timeOther: { alignSelf: 'flex-start' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: colors.orange },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  bubbleText: { color: colors.ink, fontFamily: fonts.sans },
  bubbleTextMine: { color: colors.white, fontFamily: fonts.sans },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cream
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 10,
    fontFamily: fonts.sans
  },
  send: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendBusy: { opacity: 0.5 },
  error: { color: colors.orange, textAlign: 'center', padding: 8, fontFamily: fonts.sans }
});
