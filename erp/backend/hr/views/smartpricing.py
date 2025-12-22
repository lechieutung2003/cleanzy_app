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
    permission_classes = []
    
    def post(self, request):
        print("------------------------------------")
        print("🚀 Received Smart Pricing prediction request", request.data)
        try:
            # Validate input
            service_id = request.data.get('service_id')
            area_m2 = request.data.get('area_m2')
            hours_peak = request.data.get('hours_peak', False)
            customer_id = request.data.get('customer_id')
            
            
            
            if service_id is None or area_m2 is None:
                return Response(
                    {'error': 'service_id và area_m2 là bắt buộc'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Predict
            predictor = SmartPricingPredictor()
            result = predictor.predict_optimal_price(
                service_id=service_id,
                area_m2=area_m2,
                customer_id=customer_id,
                hours_peak=hours_peak
            )
            
            print("Result: ", result)
            
            print(f"💰 Smart Pricing predicted: {result['proposed_price']} VND")
            print("------------------------------------")
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ Error predicting price: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )