export interface ProblemTestCase {
  stdin: string
  expectedStdout: string
  description: string
}

export interface Problem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  description: string
  examples: string[]
  constraints: string[]
  starterCode: Record<string, string>
  solution: string
  solutionExplanation: string
  tags: string[]
  acceptanceRate: number
  likes: number
  dislikes: number
  testCases: ProblemTestCase[]
}

export const PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
      "Input: nums = [3,2,4], target = 6\nOutput: [1,2]",
      "Input: nums = [3,3], target = 6\nOutput: [0,1]"
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    starterCode: {
      python: `import sys

def two_sum(nums, target):
    # Write your solution here
    pass

# Read input
line1 = input().split()
nums = list(map(int, line1))
target = int(input())
result = two_sum(nums, target)
print(result[0], result[1])`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
  const nums = lines[0].split(' ').map(Number);
  const target = Number(lines[1]);
  const result = twoSum(nums, target);
  console.log(result[0] + ' ' + result[1]);
});

function twoSum(nums, target) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().split(" ");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = Integer.parseInt(sc.nextLine());
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}`
    },
    solution: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    solutionExplanation: "Use a hash map to store each number's index. For each number, check if its complement (target - num) is already in the map. O(n) time, O(n) space.",
    tags: ["Array", "Hash Table"],
    acceptanceRate: 52,
    likes: 5243,
    dislikes: 187,
    testCases: [
      { stdin: "2 7 11 15\n9", expectedStdout: "0 1", description: "Basic case" },
      { stdin: "3 2 4\n6", expectedStdout: "1 2", description: "Target in middle" },
      { stdin: "3 3\n6", expectedStdout: "0 1", description: "Duplicate numbers" }
    ]
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    category: "Math",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same forward and backward.`,
    examples: [
      "Input: x = 121\nOutput: true\nExplanation: 121 reads as 121 from left to right and from right to left.",
      "Input: x = -121\nOutput: false\nExplanation: From left to right, it reads -121. From right to left it becomes 121-.",
      "Input: x = 10\nOutput: false"
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    starterCode: {
      python: `def is_palindrome(x):
    # Write your solution here
    pass

x = int(input())
print("true" if is_palindrome(x) else "false")`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const x = Number(line);
  console.log(isPalindrome(x) ? "true" : "false");
  rl.close();
});

function isPalindrome(x) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isPalindrome(int x) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = Integer.parseInt(sc.nextLine().trim());
        System.out.println(isPalindrome(x) ? "true" : "false");
    }
}`
    },
    solution: `def is_palindrome(x):
    if x < 0:
        return False
    return str(x) == str(x)[::-1]`,
    solutionExplanation: "Negative numbers are never palindromes. For positive numbers, convert to string and compare with its reverse. O(n) time where n is the number of digits.",
    tags: ["Math"],
    acceptanceRate: 55,
    likes: 3102,
    dislikes: 210,
    testCases: [
      { stdin: "121", expectedStdout: "true", description: "Palindrome" },
      { stdin: "-121", expectedStdout: "false", description: "Negative number" },
      { stdin: "10", expectedStdout: "false", description: "Trailing zero" },
      { stdin: "0", expectedStdout: "true", description: "Zero" }
    ]
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    difficulty: "Easy",
    category: "Math",
    description: `Given an integer n, return a string array answer (1-indexed) where:

- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
- answer[i] == "Fizz" if i is divisible by 3.
- answer[i] == "Buzz" if i is divisible by 5.
- answer[i] == i (as a string) if none of the above conditions are true.

Print each element on its own line.`,
    examples: [
      'Input: n = 3\nOutput:\n1\n2\nFizz',
      'Input: n = 5\nOutput:\n1\n2\nFizz\n4\nBuzz',
      'Input: n = 15\nOutput:\n1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz'
    ],
    constraints: [
      "1 <= n <= 10^4"
    ],
    starterCode: {
      python: `def fizzbuzz(n):
    # Write your solution here
    # Print each element on its own line
    pass

n = int(input())
fizzbuzz(n)`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const n = Number(line);
  fizzBuzz(n);
  rl.close();
});

function fizzBuzz(n) {
  // Write your solution here
  // Use console.log() for each element
}`,
      java: `import java.util.*;

public class Main {
    public static void fizzBuzz(int n) {
        // Write your solution here
        // Use System.out.println() for each element
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        fizzBuzz(n);
    }
}`
    },
    solution: `def fizzbuzz(n):
    for i in range(1, n + 1):
        if i % 15 == 0:
            print("FizzBuzz")
        elif i % 3 == 0:
            print("Fizz")
        elif i % 5 == 0:
            print("Buzz")
        else:
            print(i)`,
    solutionExplanation: "Iterate from 1 to n. Check divisibility by 15 first (both 3 and 5), then by 3, then by 5. O(n) time, O(1) space.",
    tags: ["Math", "String"],
    acceptanceRate: 70,
    likes: 1820,
    dislikes: 250,
    testCases: [
      { stdin: "3", expectedStdout: "1\n2\nFizz", description: "n = 3" },
      { stdin: "5", expectedStdout: "1\n2\nFizz\n4\nBuzz", description: "n = 5" },
      { stdin: "15", expectedStdout: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", description: "n = 15" }
    ]
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "Strings",
    description: `Write a function that reverses a string. The input string is given as a single line.

Print the reversed string.`,
    examples: [
      'Input: hello\nOutput: olleh',
      'Input: Hannah\nOutput: hannaH'
    ],
    constraints: [
      "1 <= s.length <= 10^5",
      "s consists of printable ASCII characters."
    ],
    starterCode: {
      python: `def reverse_string(s):
    # Write your solution here
    pass

s = input()
print(reverse_string(s))`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(reverseString(line));
  rl.close();
});

function reverseString(s) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static String reverseString(String s) {
        // Write your solution here
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(reverseString(s));
    }
}`
    },
    solution: `def reverse_string(s):
    return s[::-1]`,
    solutionExplanation: "Use Python slicing with step -1 to reverse. O(n) time and space.",
    tags: ["String", "Two Pointers"],
    acceptanceRate: 76,
    likes: 2100,
    dislikes: 90,
    testCases: [
      { stdin: "hello", expectedStdout: "olleh", description: "Basic case" },
      { stdin: "Hannah", expectedStdout: "hannaH", description: "Mixed case" },
      { stdin: "a", expectedStdout: "a", description: "Single character" }
    ]
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print "true" or "false".`,
    examples: [
      'Input: ()\nOutput: true',
      'Input: ()[]{}\nOutput: true',
      'Input: (]\nOutput: false'
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    starterCode: {
      python: `def is_valid(s):
    # Write your solution here
    pass

s = input()
print("true" if is_valid(s) else "false")`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(isValid(line) ? "true" : "false");
  rl.close();
});

function isValid(s) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(isValid(s) ? "true" : "false");
    }
}`
    },
    solution: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()
        else:
            stack.append(char)
    return len(stack) == 0`,
    solutionExplanation: "Use a stack. Push opening brackets, and for closing brackets, check if the top of stack matches. O(n) time, O(n) space.",
    tags: ["String", "Stack"],
    acceptanceRate: 42,
    likes: 4500,
    dislikes: 180,
    testCases: [
      { stdin: "()", expectedStdout: "true", description: "Simple valid" },
      { stdin: "()[]{}", expectedStdout: "true", description: "Multiple types" },
      { stdin: "(]", expectedStdout: "false", description: "Mismatched" },
      { stdin: "([)]", expectedStdout: "false", description: "Wrong order" },
      { stdin: "{[]}", expectedStdout: "true", description: "Nested" }
    ]
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Input: first line contains space-separated integers.
Output: the maximum subarray sum.`,
    examples: [
      "Input: -2 1 -3 4 -1 2 1 -5 4\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.",
      "Input: 1\nOutput: 1",
      "Input: 5 4 -1 7 8\nOutput: 23"
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    starterCode: {
      python: `def max_subarray(nums):
    # Write your solution here
    pass

nums = list(map(int, input().split()))
print(max_subarray(nums))`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  console.log(maxSubArray(nums));
  rl.close();
});

function maxSubArray(nums) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().split(" ");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        System.out.println(maxSubArray(nums));
    }
}`
    },
    solution: `def max_subarray(nums):
    max_sum = current = nums[0]
    for num in nums[1:]:
        current = max(num, current + num)
        max_sum = max(max_sum, current)
    return max_sum`,
    solutionExplanation: "Kadane's algorithm: track the maximum sum ending at each position. Either start a new subarray at current element or extend the previous one. O(n) time, O(1) space.",
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    acceptanceRate: 50,
    likes: 6200,
    dislikes: 280,
    testCases: [
      { stdin: "-2 1 -3 4 -1 2 1 -5 4", expectedStdout: "6", description: "Mixed array" },
      { stdin: "1", expectedStdout: "1", description: "Single element" },
      { stdin: "5 4 -1 7 8", expectedStdout: "23", description: "Mostly positive" },
      { stdin: "-1", expectedStdout: "-1", description: "Single negative" }
    ]
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      "Input: 2\nOutput: 2\nExplanation: 1+1, 2",
      "Input: 3\nOutput: 3\nExplanation: 1+1+1, 1+2, 2+1"
    ],
    constraints: [
      "1 <= n <= 45"
    ],
    starterCode: {
      python: `def climb_stairs(n):
    # Write your solution here
    pass

n = int(input())
print(climb_stairs(n))`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(climbStairs(Number(line)));
  rl.close();
});

function climbStairs(n) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static int climbStairs(int n) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        System.out.println(climbStairs(n));
    }
}`
    },
    solution: `def climb_stairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
    solutionExplanation: "This is the Fibonacci sequence. dp[i] = dp[i-1] + dp[i-2]. Use two variables instead of an array. O(n) time, O(1) space.",
    tags: ["Dynamic Programming", "Math"],
    acceptanceRate: 52,
    likes: 4100,
    dislikes: 130,
    testCases: [
      { stdin: "2", expectedStdout: "2", description: "n = 2" },
      { stdin: "3", expectedStdout: "3", description: "n = 3" },
      { stdin: "5", expectedStdout: "8", description: "n = 5" },
      { stdin: "10", expectedStdout: "89", description: "n = 10" }
    ]
  },
  {
    id: "roman-to-integer",
    title: "Roman to Integer",
    difficulty: "Easy",
    category: "Math",
    description: `Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M.

Symbol   Value
I        1
V        5
X        10
L        50
C        100
D        500
M        1000

Given a roman numeral, convert it to an integer.`,
    examples: [
      "Input: III\nOutput: 3",
      "Input: LVIII\nOutput: 58\nExplanation: L = 50, V = 5, III = 3.",
      "Input: MCMXCIV\nOutput: 1994\nExplanation: M=1000, CM=900, XC=90, IV=4."
    ],
    constraints: [
      "1 <= s.length <= 15",
      "s contains only the characters ('I','V','X','L','C','D','M')."
    ],
    starterCode: {
      python: `def roman_to_int(s):
    # Write your solution here
    pass

s = input()
print(roman_to_int(s))`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  console.log(romanToInt(line.trim()));
  rl.close();
});

function romanToInt(s) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static int romanToInt(String s) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        System.out.println(romanToInt(s));
    }
}`
    },
    solution: `def roman_to_int(s):
    values = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}
    total = 0
    for i in range(len(s)):
        if i + 1 < len(s) and values[s[i]] < values[s[i+1]]:
            total -= values[s[i]]
        else:
            total += values[s[i]]
    return total`,
    solutionExplanation: "Iterate through the string. If the current value is less than the next value, subtract it (e.g. IV = -1 + 5 = 4). Otherwise add it. O(n) time, O(1) space.",
    tags: ["Math", "String", "Hash Table"],
    acceptanceRate: 60,
    likes: 3800,
    dislikes: 220,
    testCases: [
      { stdin: "III", expectedStdout: "3", description: "Simple" },
      { stdin: "LVIII", expectedStdout: "58", description: "Addition only" },
      { stdin: "MCMXCIV", expectedStdout: "1994", description: "Subtraction cases" },
      { stdin: "IX", expectedStdout: "9", description: "Single subtraction" }
    ]
  },
  {
    id: "merge-sorted-arrays",
    title: "Merge Two Sorted Arrays",
    difficulty: "Easy",
    category: "Arrays",
    description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order.

Merge the two arrays into one sorted array and print the result as space-separated values.

Input: Two lines, each containing space-separated integers.
Output: A single line of space-separated integers (the merged sorted array).`,
    examples: [
      "Input:\n1 3 5 7\n2 4 6 8\nOutput: 1 2 3 4 5 6 7 8",
      "Input:\n1\n\nOutput: 1"
    ],
    constraints: [
      "0 <= nums1.length, nums2.length <= 200",
      "-10^9 <= nums1[i], nums2[j] <= 10^9"
    ],
    starterCode: {
      python: `def merge_sorted(nums1, nums2):
    # Write your solution here
    pass

nums1 = list(map(int, input().split())) if True else []
line2 = input()
nums2 = list(map(int, line2.split())) if line2.strip() else []
result = merge_sorted(nums1, nums2)
print(' '.join(map(str, result)))`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
  const nums1 = lines[0].trim() ? lines[0].split(' ').map(Number) : [];
  const nums2 = lines[1] && lines[1].trim() ? lines[1].split(' ').map(Number) : [];
  console.log(mergeSorted(nums1, nums2).join(' '));
});

function mergeSorted(nums1, nums2) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static int[] mergeSorted(int[] nums1, int[] nums2) {
        // Write your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line1 = sc.nextLine();
        String line2 = sc.hasNextLine() ? sc.nextLine() : "";
        int[] nums1 = line1.trim().isEmpty() ? new int[0] : Arrays.stream(line1.split(" ")).mapToInt(Integer::parseInt).toArray();
        int[] nums2 = line2.trim().isEmpty() ? new int[0] : Arrays.stream(line2.split(" ")).mapToInt(Integer::parseInt).toArray();
        int[] result = mergeSorted(nums1, nums2);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) { if (i > 0) sb.append(" "); sb.append(result[i]); }
        System.out.println(sb);
    }
}`
    },
    solution: `def merge_sorted(nums1, nums2):
    result = []
    i = j = 0
    while i < len(nums1) and j < len(nums2):
        if nums1[i] <= nums2[j]:
            result.append(nums1[i])
            i += 1
        else:
            result.append(nums2[j])
            j += 1
    result.extend(nums1[i:])
    result.extend(nums2[j:])
    return result`,
    solutionExplanation: "Two-pointer approach. Compare elements from both arrays and pick the smaller one. Append remaining elements. O(n+m) time, O(n+m) space.",
    tags: ["Array", "Two Pointers", "Sorting"],
    acceptanceRate: 48,
    likes: 2900,
    dislikes: 150,
    testCases: [
      { stdin: "1 3 5 7\n2 4 6 8", expectedStdout: "1 2 3 4 5 6 7 8", description: "Interleaved" },
      { stdin: "1 2 3\n4 5 6", expectedStdout: "1 2 3 4 5 6", description: "No interleave" },
      { stdin: "1\n2", expectedStdout: "1 2", description: "Single elements" }
    ]
  },
  {
    id: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Print "true" or "false".`,
    examples: [
      "Input: 1 2 3 1\nOutput: true",
      "Input: 1 2 3 4\nOutput: false",
      "Input: 1 1 1 3 3 4 3 2 4 2\nOutput: true"
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9"
    ],
    starterCode: {
      python: `def contains_duplicate(nums):
    # Write your solution here
    pass

nums = list(map(int, input().split()))
print("true" if contains_duplicate(nums) else "false")`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const nums = line.split(' ').map(Number);
  console.log(containsDuplicate(nums) ? "true" : "false");
  rl.close();
});

function containsDuplicate(nums) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static boolean containsDuplicate(int[] nums) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
        System.out.println(containsDuplicate(nums) ? "true" : "false");
    }
}`
    },
    solution: `def contains_duplicate(nums):
    return len(nums) != len(set(nums))`,
    solutionExplanation: "Convert to a set and compare lengths. If the set is smaller, there were duplicates. O(n) time, O(n) space.",
    tags: ["Array", "Hash Table", "Sorting"],
    acceptanceRate: 61,
    likes: 3200,
    dislikes: 170,
    testCases: [
      { stdin: "1 2 3 1", expectedStdout: "true", description: "Has duplicate" },
      { stdin: "1 2 3 4", expectedStdout: "false", description: "All unique" },
      { stdin: "1 1 1 3 3 4 3 2 4 2", expectedStdout: "true", description: "Multiple duplicates" }
    ]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Binary Search",
    description: `Given a sorted array of integers nums and an integer target, write a function to search target in nums. If target exists, print its index. Otherwise, print -1.

Input: first line is the sorted array (space-separated), second line is the target.`,
    examples: [
      "Input:\n-1 0 3 5 9 12\n9\nOutput: 4",
      "Input:\n-1 0 3 5 9 12\n2\nOutput: -1"
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All integers in nums are unique.",
      "nums is sorted in ascending order."
    ],
    starterCode: {
      python: `def binary_search(nums, target):
    # Write your solution here
    pass

nums = list(map(int, input().split()))
target = int(input())
print(binary_search(nums, target))`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l));
rl.on('close', () => {
  const nums = lines[0].split(' ').map(Number);
  const target = Number(lines[1]);
  console.log(binarySearch(nums, target));
});

function binarySearch(nums, target) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static int binarySearch(int[] nums, int target) {
        // Write your solution here
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] nums = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
        int target = Integer.parseInt(sc.nextLine().trim());
        System.out.println(binarySearch(nums, target));
    }
}`
    },
    solution: `def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    solutionExplanation: "Classic binary search. Compare the middle element with target and narrow the search space by half. O(log n) time, O(1) space.",
    tags: ["Array", "Binary Search"],
    acceptanceRate: 58,
    likes: 3500,
    dislikes: 100,
    testCases: [
      { stdin: "-1 0 3 5 9 12\n9", expectedStdout: "4", description: "Found in array" },
      { stdin: "-1 0 3 5 9 12\n2", expectedStdout: "-1", description: "Not found" },
      { stdin: "5\n5", expectedStdout: "0", description: "Single element found" }
    ]
  },
  {
    id: "best-time-to-buy-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Arrays",
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    examples: [
      "Input: 7 1 5 3 6 4\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
      "Input: 7 6 4 3 1\nOutput: 0\nExplanation: No profitable transaction is possible."
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    starterCode: {
      python: `def max_profit(prices):
    # Write your solution here
    pass

prices = list(map(int, input().split()))
print(max_profit(prices))`,
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const prices = line.split(' ').map(Number);
  console.log(maxProfit(prices));
  rl.close();
});

function maxProfit(prices) {
  // Write your solution here
}`,
      java: `import java.util.*;

public class Main {
    public static int maxProfit(int[] prices) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] prices = Arrays.stream(sc.nextLine().split(" ")).mapToInt(Integer::parseInt).toArray();
        System.out.println(maxProfit(prices));
    }
}`
    },
    solution: `def max_profit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit`,
    solutionExplanation: "Track the minimum price seen so far and the maximum profit at each step. O(n) time, O(1) space.",
    tags: ["Array", "Dynamic Programming"],
    acceptanceRate: 54,
    likes: 5800,
    dislikes: 200,
    testCases: [
      { stdin: "7 1 5 3 6 4", expectedStdout: "5", description: "Normal case" },
      { stdin: "7 6 4 3 1", expectedStdout: "0", description: "Decreasing prices" },
      { stdin: "2 4 1", expectedStdout: "2", description: "Buy first sell second" }
    ]
  }
]
