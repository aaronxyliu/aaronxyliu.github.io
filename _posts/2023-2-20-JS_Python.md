---
title: The Difference in Common Usage between JavaScript and Python
date: 2023-02-20 14:00:00 -500
categories: [Programming Language]
tags: [javascript, python, lang-en]
---
### 

##### Number Calculation

- Retain Decimals

```js
let a = 1.2345; a.toFixed(3)			//1.234
```

```python
a = 1.2345; round(a,3);           # 1.234
```

##### String

- Length

```js
str.length
```

```python
len(str)
```

- Concatenate

```js
let a = 1;    let str = `a: ${a}`;        // 'a: 1'
```

```python
a = 1;        str = f'a: {a}';				    #  'a: 1'
```

- Slice

```js
let str = '123';   str.slice(0,1);        //'1'
```

```python
str = '123';       str[:1];               # '1'
```

- Match and Replace

```js
let str = 'Nice to meet you!';
str.indexOf('e');											 //3
str.lastIndexOf('e');									 //10
str.replace(/e/g, '1');					       //'Nic1 to m11t you!'
```

```python
str = 'Nice to meet you!'
str.find('e', beg=0, end=len(str))                   # 3
str.replace('e', '1',  num=string.count(str))        # 'Nic1 to m11t you!'
```

- JSON Serialization

```js
let obj = {};
let json_str = JSON.stringify(obj);			//Serialization
let obj = JSON.parse(json_str);					//Deserialization
```

```python
import json
obj = {}
json_str = json.dumps(obj, index=4)			# Serialization
obj = json.loads(json_str)							# Deserialization
```

##### Condition

- **if** condition

```js
if (1 < 2 && 3 < 4) {
  console.log('Yes.');
}
```

```python
if 1 < 2 and 3 < 4:
  print('Yes.')
```

- **for** loop

```js
let arr = ['a', 'b', 'c'];
for (let v of arr) { 														//NOTE the 'of'!
  console.log(v);																//a b c
}									  

let _dict = {'on':'e', 'tw':'o', 'thre':'e'};
for (let k in _dict) { 
  console.log(k + _dict[k]); 										//one two three
}						     
```

```python
arr = ['a', 'b', 'c']
for v in arr:
  print(v)                                      # a b c

_dict = {'on':'e', 'tw':'o', 'thre':'e'}
for k, v in _dict.items():											# NEED "items()"!
  print(k + _dict[k]);					     				    # one two three
```

##### Array

- Add and Remove

```js
let arr = [];
arr.push(1);							// Add in the tail
arr.pop();								// Remove last element
arr.length;
```

```python
list = []
list.append(1)
list.pop()
len(list)
```

- Sort

```js
arr.sort((a, b) => b.score - a.score)					// descending order
```

```python
arr.sort(key=lambda x: x.score, reverse=True)	 # descending order
```

