import torch
import torch.nn as nn
from torchvision import datasets, models, transforms
import os
from datetime import datetime

import platform

if platform.system() == "Windows":
    # Spring Boot가 사진을 저장하는 그 폴더입니다.
    BASE_DIR = r'C:/project_uploads/relearn'
    # 기존에 만들어진 모델 파일 경로
    SAVE_PATH = r'C:/Users/C603/Documents/AWS Class/git/aws_class/python/testfood/nyamnyam_model.pth'
else:
    # AWS(리눅스) 환경일 때의 경로
    BASE_DIR = '/home/ubuntu/project/uploads/relearn'
    SAVE_PATH = '/home/ubuntu/project/python/nyamnyam_model.pth'

def train_update():
    print(f"[{datetime.now()}] 자동 재학습 파이프라인 가동...")

    #데이터 전처리 (데이터 증강 기술 추가!)
    # 사진이 적을 때를 대비해 약간씩 돌리고 뒤집어서 공부시킵니다.
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(), # 좌우 반전
        transforms.RandomRotation(10),      # 10도 이내 회전
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    #새로운 데이터셋 로드
    if not os.path.exists(BASE_DIR):
        print("에러: 학습할 사진 폴더가 없습니다!")
        return

    image_datasets = datasets.ImageFolder(BASE_DIR, data_transforms)
    dataloaders = torch.utils.data.DataLoader(image_datasets, batch_size=4, shuffle=True)
    class_names = image_datasets.classes
    print(f"발견된 음식 카테고리: {class_names}")

    #[핵심] 기존 모델 불러오기
    print("기존 모델을 불러오는 중...")
    model = models.resnet18()
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(class_names))

    # 기존 학습된 가중치(Weight) 입히기
    if os.path.exists(SAVE_PATH):
        checkpoint = torch.load(SAVE_PATH)
        model.load_state_dict(checkpoint['model_state_dict'])
        print("기존 지식을 성공적으로 로드했습니다.")
    else:
        print("기존 모델이 없어 처음부터 학습을 시작합니다.")

    #재학습 설정 (학습률을 낮게 설정하는 것이 포인트!)
    criterion = nn.CrossEntropyLoss()
    # lr=0.0001 정도로 낮게 잡아야 기존 지식이 파괴되지 않고 '추가'공부가 됩니다.
    optimizer = torch.optim.SGD(model.parameters(), lr=0.0001, momentum=0.9)

    #추가 학습 시작
    model.train()
    epochs = 5 # 추가 공부는 5번 정도면 적당합니다.
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

    #업데이트된 모델 저장 (이름을 동일하게 해서 덮어쓰기)
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_names': class_names
    }, SAVE_PATH)

    print(f"[{datetime.now()}] 모델 업데이트 완료! 이제 AI가 더 똑똑해졌습니다.")

if __name__ == "__main__":
    train_update()