// Issues with code:
// 1. Fetching inside useEffect without cleanup:
    // Issue: The useEffect hook is fetching data but does not handle component unmounting.
        //This can lead to memory leaks if the component is unmounted before the data fetch completes.
    // Improvement: Implement a cleanup function within the useEffect hook to handle component unmounting. 
        //This ensures that if the component unmounts before the data fetch completes, the state update won't be attempted on an unmounted component.

// 2. useWalletBalances hook is not implemented:
    // Issue: The useWalletBalances hook is being called but not implemented, resulting in an empty array of balances.
    // Improvement: Implement the useWalletBalances hook to fetch and return the wallet balances.

// 3. Inconsistent variable names and inefficient logic:
    // Issue: There are logical errors in filtering and sorting balances. eg. lhsPriority > -99, is not defined and the
        // sorting function does not have a return value for cases where priorities are equal.
    // Improvement: Ensure that balances are filtered correctly based on their amount and are sorted based on the correct priorities. and use proper variable names.

// 4. Wrong Error Handling:
    // The error in the useEffect is logged with console.err which is incorrect.
    // Improvement: Use console.error.

// 5. Incorrect TypeScript Types:
    // Types for blockchain in WalletBalance and missing props for WalletRow.
    // Improvement: Correct TypeScript typings.

// 6. Props extends BoxProps but BoxProps is not defined/imported.
    //  Improvement: Define BoxProps interface.



// Improved code
    import React, { useEffect, useState, useMemo } from 'react';
    import { ReactNode } from 'react';

    interface WalletBalance {
      currency: string;
      amount: number;
      blockchain: string;
    }
    
    interface FormattedWalletBalance extends WalletBalance {
      formatted: string;
    }
    
    class Datasource {
      url: string;

      constructor(url: string) {
        this.url = url;
      }
      
      async getPrices(): Promise<Record<string, number>> {
        try {
          const response = await fetch(this.url);
          if (!response.ok) {
            throw new Error('Network response failed with status ${response.status}`');
          }
          const prices = await response.json();
          return prices;
        } catch (error) {
          console.error('Failed to fetch prices:', error);
          throw error;
        }
      }
    }

    interface BoxProps {
    }      
    
    interface Props extends BoxProps {
      children?: ReactNode;
    }

    const useWalletBalances = () => {
        // placeholder for implementation of useWalletBalances hook
        return [];
      };
    
    const WalletPage: React.FC<Props> = (props: Props) => {
      const { children, ...rest } = props;
      const balances = useWalletBalances(); // missing function to get wallet balances
      const [prices, setPrices] = useState({});
    
      useEffect(() => {
        const datasource = new Datasource("https://interview.switcheo.com/prices.json");

        let isMounted = true;
    
        datasource.getPrices().then(prices => {
          if (isMounted) {
            setPrices(prices);
          }
        }).catch(error => {
          console.error(error);
        });
        return () => {
          isMounted = false; // Cleanup function to prevent state updates if the component is unmounted
        };
      }, []);
    
      const getPriority = (blockchain: string): number => {
        switch (blockchain) {
          case 'Osmosis':
            return 100;
          case 'Ethereum':
            return 50;
          case 'Arbitrum':
            return 30;
          case 'Zilliqa':
            return 20;
          case 'Neo':
            return 20;
          default:
            return -99;
        }
      };
    
      const sortedBalances = useMemo(() => {
        return balances
          .filter((balance: WalletBalance) => {
            const balancePriority = getPriority(balance.blockchain);
            return balancePriority > -99 && balance.amount <= 0;
          })
          .sort((lhs: WalletBalance, rhs: WalletBalance) => {
            const leftPriority = getPriority(lhs.blockchain);
            const rightPriority = getPriority(rhs.blockchain);
            return rightPriority - leftPriority;
          });
      }, [balances, prices]);
    
      const formattedBalances = sortedBalances.map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
      }));
    
      const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount;
        return (
          <WalletRow 
            key={index}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
            className={classes.row}
          />
        );
      });
    
      return (
        <div {...rest}>
          {rows}
        </div>
      );
    };
    