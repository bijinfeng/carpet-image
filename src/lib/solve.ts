import { Decimal } from 'decimal.js';

/**
 * const divisors: number[] = [124, 567, 990];
 * const constant: number = 10;
 * 查找能被 124, 567, 990 整除的最小整数 x，使得 x + 10 能被 124, 567, 990 整除
 */
export function solve(divisors: number[], constant: number): number | null {
	const precision = 2000; // increased precision for 4 decimal places
	const decimalConstant = new Decimal(constant);

	// Search around 0
	for (let i = 0; i <= precision; i++) {
		let x: Decimal;

		if (i % 2 === 0) {
			// Even: Positive direction
			x = new Decimal(i).dividedBy(new Decimal(precision));
		} else {
			// Odd: Negative direction
			x = new Decimal(-(i + 1)).dividedBy(new Decimal(precision));
		}

		const value = decimalConstant.plus(x);
		let allDivisible = true;

		for (const divisor of divisors) {
			const decimalDivisor = new Decimal(divisor);
			const remainder = value.mod(decimalDivisor);

			if (remainder.abs().greaterThan(1e-8)) {
				allDivisible = false;
				break;
			}
		}

		if (allDivisible) {
			const result = Number(x.toFixed(4));
			console.log(`找到精确解: x = ${result}`);
			return result;
		}
	}

	console.log('没有找到精确解');
	return null;
}
