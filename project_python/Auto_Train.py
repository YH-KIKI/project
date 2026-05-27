import torch
import torch.nn as nn
from torchvision import datasets, models, transforms
import os
from datetime import datetime
import re
import codecs
import platform

if platform.system() == "Windows":
    BASE_DIR = r'C:/project_uploads/relearn'
    SAVE_PATH = r'C:/Users/C603/Documents/AWS Class/git/project_practice/project/project_python/model/nyamnyam_model.pth'
else:
    BASE_DIR = '/app/uploads/relearn'
    SAVE_PATH = '/project_python/model/nyamnyam_model.pth'

def train_update():
    print(f"[{datetime.now()}] 자동 재학습 파이프라인 가동...")

    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(), 
        transforms.RandomRotation(10),      
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]) 
    ])

    if not os.path.exists(BASE_DIR):
        print("에러: 학습할 사진 폴더가 없습니다!")
        return

    image_datasets = datasets.ImageFolder(BASE_DIR, data_transforms)
    cleaned_classes = []
    for c in image_datasets.classes:
        if isinstance(c, str):
            try:
                if platform.system() == "Windows" and re.match(r'^\d+_\d+', c):
                    c_converted = "\\" + c.replace("_", "\\")
                    cleaned = codecs.escape_decode(bytes(c_converted, "utf-8"))[0].decode("utf-8")
                elif '\\' in c or '35' in c:
                    cleaned = codecs.escape_decode(bytes(c, "utf-8"))[0].decode("utf-8")
                else:
                    cleaned = c.encode('utf-8', 'surrogateescape').decode('utf-8', 'ignore')
                cleaned_classes.append(cleaned if cleaned else c)
            except Exception as e:
                print(f"⚠️ 복원 실패 사유: {e}")
                cleaned_classes.append(c)
        else:
            cleaned_classes.append(c)
            
    image_datasets.classes = cleaned_classes
    dataloaders = torch.utils.data.DataLoader(image_datasets, batch_size=4, shuffle=True)
    new_scanned_classes = image_datasets.classes
    print(f"🔍 이번에 탐지된 신상 음식 폴더 목록: {new_scanned_classes}")

    model = models.resnet18(pretrained=True)
    num_ftrs = model.fc.in_features

    final_class_names = []

    # [핵심 수술] 기존 지식 가방을 열어서 옛날 음식 순서를 100% 그대로 지켜내기
    if os.path.exists(SAVE_PATH):
        try:
            checkpoint = torch.load(SAVE_PATH, map_location=torch.device('cpu'))
            old_class_names = checkpoint.get('class_names', [])
            
            if old_class_names:
                # 옛날 순서(0, 1, 2, 3번 방)를 '맨 앞'에 그대로 박아둡니다
                final_class_names = list(old_class_names)
                
                # 옛날 방 구조 그대로 복원해서 기존 지식 가중치를 완벽하게 먼저 흡수
                model.fc = nn.Linear(num_ftrs, len(old_class_names))
                model.load_state_dict(checkpoint['model_state_dict'])
                print(f"🟢 [순서 동기화] 이전 지식 방 위치 고정 완료: {old_class_names}")
                
                # 기존 방 뒤에다가 이번에 새로 들어온 음식들을 중복 없이 줄 세우기
                for nc in new_scanned_classes:
                    if nc not in final_class_names:
                        final_class_names.append(nc)
            else:
                final_class_names = new_scanned_classes
        except Exception as e:
            print(f"⚠️ 기존 가방 로드 실패로 새로 시작냥: {e}")
            final_class_names = new_scanned_classes
    else:
        final_class_names = new_scanned_classes

    # 지식 유실 없이 방 크기만 뒤로 늘려주기 수술 (가중치 보존 수술)
    old_fc = model.fc
    model.fc = nn.Linear(num_ftrs, len(final_class_names))
    
    # 기존에 로드했던 4개 음식 가중치 자리를 새 fc 문짝의 앞부분에 똑같이 이식
    with torch.no_grad():
        if isinstance(old_fc, nn.Linear):
            model.fc.weight[:old_fc.out_features] = old_fc.weight
            model.fc.bias[:old_fc.out_features] = old_fc.bias

    # [매우 중요] ImageFolder의 정답 번호표가 뒤틀리는 걸 막기 위해, 강제로 우리가 정렬한 final_class_names 인덱스로 매핑
    class_to_idx = {cls_name: i for i, cls_name in enumerate(final_class_names)}
    image_datasets.class_to_idx = class_to_idx
    # 샘플들의 라벨 번호표도 새 장부 순서에 맞게 강제 업데이트
    updated_samples = []
    for path, _ in image_datasets.samples:
        folder_name = os.path.basename(os.path.dirname(path))
        # 복원 로직 거친 이름과 매칭
        for actual_name in new_scanned_classes:
            if folder_name in actual_name or actual_name in folder_name:
                updated_samples.append((path, class_to_idx[actual_name]))
                break
        else:
            updated_samples.append((path, _))
    image_datasets.samples = updated_samples
    # 데이터로더 재갱신
    dataloaders = torch.utils.data.DataLoader(image_datasets, batch_size=4, shuffle=True)

    print(f"🔥 [최종 정렬 완성] 정답 번호표 엇갈림이 완전히 방지된 누적 음식 장부: {final_class_names}")

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=0.001, momentum=0.9) # 학습률 살짝 올려서 확실하게 각인

    model.train()
    epochs = 25 
    for epoch in range(epochs):
        running_loss = 0.0
        for inputs, labels in dataloaders:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        print(f"Epoch {epoch+1}/{epochs} - Loss: {running_loss/len(dataloaders):.4f}")

    # 순정 포맷 그대로 장부와 가중치를 깨끗하게 덮어쓰기 저장
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_names': final_class_names
    }, SAVE_PATH)

    print(f"[{datetime.now()}] 재학습성공")

if __name__ == "__main__":
    train_update()