import { useEffect } from "react";

export default function useWebSocket(url, options = {}) {
  const {
    reconnectLimit = 3, // 重连限制次数 (null 为无限)
    reconnectInterval = 3000, // 基础重连间隔
    heartbeatInterval = 30000,
  } = options;

  let socket = null;
  let status = "disconnected"; // 状态：未连接/连接中/已连接
  let reconnectCount = 0;
  let reconnectTimer = null;
  let heartbeatTimer = null;

  const initWebSocket = () => {
    if (socket) socket.close();
    status = "connecting";
    socket = new WebSocket(url);

    socket.onopen = (event) => {
      status = "connected";
      reconnectCount = 0; // 连接成功重置计数器
      startHeartbeat();
      options.onOpen?.(event);
    };

    socket.onmessage = (event) => {
      // 处理心跳响应或业务数据
      if (event.data === "pong") return;
      options.onMessage?.(event.data);
    };

    socket.onerror = (error) => {
      options.onError?.(error);
      handleDisconnect(); // 触发断线处理
    };

    socket.onclose = (event) => {
      options.onClose?.(event);
      handleDisconnect();
    };
  };

  // 处理断开逻辑（决定是否重连）
  const handleDisconnect = () => {
    status = "disconnected";
    stopHeartbeat();

    // 判断是否达到重连上限
    const shouldReconnect =
      reconnectLimit === null || reconnectCount < reconnectLimit;

    if (shouldReconnect) {
      reconnectCount++;
      // 使用指数退避算法，避免雪崩
      const delay =
        reconnectInterval * Math.pow(2, reconnectCount) + Math.random() * 1000;

      reconnectTimer = setTimeout(() => {
        console.log(`尝试第  $ {reconnectCount} 次重连...`);
        initWebSocket();
      }, delay);
    } else {
      console.log("重连次数已达上限，停止重连");
    }
  };

  // 心跳检测（保持活跃）
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (status === "connected" && socket) {
        socket.send("ping"); // 发送心跳包
      }
    }, heartbeatInterval);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  };

  // 手动连接/断开
  const connect = () => {
    if (status !== "disconnected") return;
    reconnectCount = 0;
    initWebSocket();
  };

  const disconnect = () => {
    if (status !== "connected") return;
    socket?.close(1000, "手动断开");
  };

  useEffect(() => {
    // 自动初始化连接
    connect();
    return () => {
      // 组件卸载时清理资源
      disconnect();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      stopHeartbeat();
    };
  });

  return {
    connect,
    disconnect,
    send: (data) => socket?.send(data),
    getStatus: () => status,
  };
}
