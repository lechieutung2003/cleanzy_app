"""
WebSocket Consumer cho payment real-time updates
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging

logger = logging.getLogger(__name__)


class PaymentConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer cho payment real-time updates
    Frontend connect đến: ws://localhost:8008/ws/payments/{order_id}/
    """
    
    async def connect(self):
        """Khi client connect WebSocket"""
        self.order_id = self.scope['url_route']['kwargs'].get('order_id')
        
        logger.info(f"🔌 WebSocket connection attempt for order: {self.order_id}")
        
        if self.order_id:
            # Join order-specific group
            self.group_name = f"payment_{self.order_id}"
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            logger.info(f"✅ Joined group: {self.group_name}")
        
        # Join broadcast group (nhận tất cả payment events)
        await self.channel_layer.group_add(
            "payment_broadcast",
            self.channel_name
        )
        logger.info(f"✅ Joined broadcast group")
        
        await self.accept()
        logger.info(f"✅ WebSocket connected for order: {self.order_id}")
        
        # Gửi message chào mừng
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to payment updates for order {self.order_id}',
            'order_id': self.order_id
        }))
    
    async def disconnect(self, close_code):
        """Khi client disconnect WebSocket"""
        logger.info(f"🔌 WebSocket disconnecting for order: {self.order_id} (code: {close_code})")
        
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f"❌ Left group: {self.group_name}")
        
        await self.channel_layer.group_discard(
            "payment_broadcast",
            self.channel_name
        )
        logger.info(f"❌ Left broadcast group")
        logger.info(f"❌ WebSocket disconnected for order: {self.order_id}")
    
    async def receive(self, text_data):
        """
        Nhận message từ WebSocket client (optional)
        Frontend có thể gửi message để request payment status
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')
            
            logger.info(f"📨 Received message from client: {message_type}")
            
            if message_type == 'ping':
                # Pong response
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
            
            elif message_type == 'request_status':
                # Client request current payment status
                # TODO: Query payment status và gửi lại
                await self.send(text_data=json.dumps({
                    'type': 'status_response',
                    'order_id': self.order_id,
                    'message': 'Status check not implemented yet'
                }))
        
        except json.JSONDecodeError:
            logger.error(f"❌ Invalid JSON received from client")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
    
    async def payment_event(self, event):
        """
        Handler khi nhận payment event từ channel layer
        Event được publish từ PaymentEventPublisher
        """
        event_name = event['event']
        data = event['data']
        
        logger.info(f"📤 Sending payment event to client: {event_name}")
        logger.debug(f"Event data: {data}")
        
        # Gửi event đến WebSocket client
        await self.send(text_data=json.dumps({
            'type': 'payment_update',
            'event': event_name,
            'data': data
        }))
        
        logger.info(f"✅ Payment event sent to client: {event_name}")
