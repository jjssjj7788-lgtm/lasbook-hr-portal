import sys

path = r'c:\Users\정상진\OneDrive\바탕 화면\라스북\직원 관리 프로젝트\frontend\src\pages\admin\EmployeeDetail.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 577번째 줄(인덱스 576)을 직접 수정
target_idx = None
for i, line in enumerate(lines):
    if "as [string, string][].map(([val, label])" in line:
        target_idx = i
        break

if target_idx is not None:
    old_line = lines[target_idx]
    # as [string, string][].map  →  as Array<[string, string]>).map
    # 또한 앞의 배열 리터럴 전체를 괄호로 감싸야 함
    new_line = old_line.replace(
        "] as [string, string][].map(([val, label])",
        "] as Array<[string, string]>).map(([val, label])"
    )
    # { 뒤에 ( 추가
    new_line = new_line.replace(
        "{[['', '선택 안 함']",
        "{([['', '선택 안 함']"
    )
    lines[target_idx] = new_line
    print(f"Fixed line {target_idx + 1}:")
    print(repr(new_line))

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Done!")
else:
    print("Target line not found!")
    # print all lines with 'map' to debug
    for i, l in enumerate(lines):
        if 'worksInStore' in l and 'map' in l:
            print(f"Line {i+1}: {repr(l)}")
