from ultralytics import YOLO 
import cv2
import pickle
import sys
import numpy as np
sys.path.append('../')
from utils import measure_distance, get_center_of_bbox

class PlayerTracker:
    def __init__(self,model_path):
        self.model = YOLO(model_path)

    def _get_court_roi(self, court_keypoints, pad_ratio=0.05):
        """Get court ROI from keypoints with padding"""
        pts = np.array(court_keypoints).reshape(-1, 2)
        min_x, min_y = pts.min(axis=0)
        max_x, max_y = pts.max(axis=0)
        w, h = max_x - min_x, max_y - min_y
        pad_x, pad_y = w * pad_ratio, h * pad_ratio
        return (min_x - pad_x, min_y - pad_y, max_x + pad_x, max_y + pad_y)

    def _bbox_center(self, bbox):
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)
    
    def _bbox_area(self, bbox):
        x1, y1, x2, y2 = bbox
        return max(0, x2 - x1) * max(0, y2 - y1)
    
    def _inside_roi(self, x, y, roi):
        x1, y1, x2, y2 = roi
        return x >= x1 and x <= x2 and y >= y1 and y <= y2

    def choose_and_filter_players(self, court_keypoints, player_detections):
        """Filter and consistently remap players to ID 1 (bottom) and 2 (top)"""
        roi = self._get_court_roi(court_keypoints, pad_ratio=0.05)
        min_area = 2000  # Minimum bbox area to filter out small detections
        
        # Get court center Y for better filtering
        pts = np.array(court_keypoints).reshape(-1, 2)
        court_center_y = pts[:, 1].mean()
        court_height = pts[:, 1].max() - pts[:, 1].min()
        
        filtered_detections = []
        last_valid = None
        
        for player_dict in player_detections:
            # Filter by ROI, area, and position
            valid_players = []
            for track_id, bbox in player_dict.items():
                cx, cy = self._bbox_center(bbox)
                area = self._bbox_area(bbox)
                
                # Must be inside ROI
                if not self._inside_roi(cx, cy, roi):
                    continue
                
                # Must have minimum area
                if area < min_area:
                    continue
                
                # Must be in reasonable Y range (not too far above/below court)
                y_distance_from_center = abs(cy - court_center_y)
                if y_distance_from_center > court_height * 0.6:
                    continue
                
                valid_players.append((track_id, bbox, cy, area))
            
            # Sort by area (largest first) and take top 2
            valid_players.sort(key=lambda x: x[3], reverse=True)
            best_two = valid_players[:2]
            
            if len(best_two) == 2:
                # Sort by Y position: higher Y (bottom) = 1, lower Y (top) = 2
                best_two.sort(key=lambda x: x[2], reverse=True)
                remapped = {
                    1: best_two[0][1],  # Bottom player
                    2: best_two[1][1]   # Top player
                }
                last_valid = remapped
            elif last_valid is not None:
                # Use last valid detection to maintain stability
                remapped = last_valid
            else:
                remapped = {}
            
            filtered_detections.append(remapped)
        
        return filtered_detections

    def choose_players(self, court_keypoints, player_dict):
        """Legacy method - kept for compatibility"""
        distances = []
        for track_id, bbox in player_dict.items():
            player_center = get_center_of_bbox(bbox)

            min_distance = float('inf')
            for i in range(0,len(court_keypoints),2):
                court_keypoint = (court_keypoints[i], court_keypoints[i+1])
                distance = measure_distance(player_center, court_keypoint)
                if distance < min_distance:
                    min_distance = distance
            distances.append((track_id, min_distance))
        
        distances.sort(key = lambda x: x[1])
        chosen_players = [distances[0][0], distances[1][0]] if len(distances) >= 2 else []
        return chosen_players


    def detect_frames(self,frames, read_from_stub=False, stub_path=None):
        player_detections = []

        if read_from_stub and stub_path is not None:
            with open(stub_path, 'rb') as f:
                player_detections = pickle.load(f)
            return player_detections

        for frame in frames:
            player_dict = self.detect_frame(frame)
            player_detections.append(player_dict)
        
        if stub_path is not None:
            with open(stub_path, 'wb') as f:
                pickle.dump(player_detections, f)
        
        return player_detections

    def detect_frame(self,frame):
        results = self.model.track(frame, persist=True)[0]
        id_name_dict = results.names

        player_dict = {}
        for box in results.boxes:
            track_id = int(box.id.tolist()[0])
            result = box.xyxy.tolist()[0]
            object_cls_id = box.cls.tolist()[0]
            object_cls_name = id_name_dict[object_cls_id]
            if object_cls_name == "person":
                player_dict[track_id] = result
        
        return player_dict

    def draw_bboxes(self,video_frames, player_detections):
        output_video_frames = []
        for frame, player_dict in zip(video_frames, player_detections):
            # Draw Bounding Boxes
            for track_id, bbox in player_dict.items():
                x1, y1, x2, y2 = bbox
                cv2.putText(frame, f"Player ID: {track_id}",(int(bbox[0]),int(bbox[1] -10 )),cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
            output_video_frames.append(frame)
        
        return output_video_frames


    