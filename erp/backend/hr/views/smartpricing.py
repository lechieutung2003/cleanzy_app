from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from hr.services.smart_pricing_service import SmartPricingPredictor
import logging

logger = logging.getLogger(__name__)

class SmartPricingView(APIView):
    """
    API để dự đoán giá tối ưu cho order mới.
    
    POST /api/smart-pricing/predict/
    Body: {
        "service_type_id": 1,
        "area_m2": 50,
        "hours_peak": false,
        "customer_history_score": 3
    }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            
            print("🚀 Received Smart Pricing prediction request", request.data)
            
            # Validate input
            service_type_id = request.data.get('service_type_id')
            area_m2 = request.data.get('area_m2')
            hours_peak = request.data.get('hours_peak', False)
            customer_history_score = request.data.get('customer_history_score', 0)
            
            if service_type_id is None or area_m2 is None:
                return Response(
                    {'error': 'service_type_id và area_m2 là bắt buộc'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Predict
            predictor = SmartPricingPredictor()
            result = predictor.predict_optimal_price(
                service_type_id=service_type_id,
                area_m2=area_m2,
                hours_peak=hours_peak,
                customer_history_score=customer_history_score
            )
            
            print(f"💰 Smart Pricing predicted: {result['proposed_price']} VND")
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ Error predicting price: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )