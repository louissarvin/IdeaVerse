import { useState, useCallback } from 'react';
import { PONDER_GRAPHQL_URL } from '../contracts/config';

interface QueryState {
  loading: boolean;
  error: string | null;
}

export const usePonderQuery = () => {
  const [state, setState] = useState<QueryState>({
    loading: false,
    error: null,
  });

  const queryPonder = useCallback(async (query: string, variables?: any) => {
    setState({ loading: true, error: null });

    try {
      const response = await fetch(PONDER_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      setState({ loading: false, error: null });
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GraphQL query failed';
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const getSuperheroes = useCallback(async (limit: number = 20) => {
    const query = `
      query GetSuperheroes($limit: Int!) {
        superheros(limit: $limit, orderBy: "createdAt", orderDirection: "desc") {
          items {
            id
            superheroId
            name
            bio
            avatarUrl
            reputation
            skills
            specialities
            flagged
            createdAt
            transactionHash
            blockNumber
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const result = await queryPonder(query, { limit });
    return result.superheros;
  }, [queryPonder]);

  const getIdeas = useCallback(async (limit: number = 20, availableOnly: boolean = true) => {
    const whereClause = availableOnly ? '(where: { isPurchased: false })' : '';
    
    const query = `
      query GetIdeas($limit: Int!) {
        ideas${whereClause}(limit: $limit, orderBy: "createdAt", orderDirection: "desc") {
          items {
            id
            ideaId
            creator
            title
            categories
            ipfsHash
            price
            ratingTotal
            numRaters
            isPurchased
            createdAt
            transactionHash
            blockNumber
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const result = await queryPonder(query, { limit });
    return result.ideas;
  }, [queryPonder]);

  const getTeams = useCallback(async (limit: number = 20) => {
    const query = `
      query GetTeams($limit: Int!) {
        teams(limit: $limit, orderBy: "createdAt", orderDirection: "desc") {
          items {
            id
            teamId
            leader
            teamName
            description
            projectName
            requiredMembers
            currentMembers
            requiredStake
            roles
            tags
            status
            createdAt
            transactionHash
            blockNumber
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;

    const result = await queryPonder(query, { limit });
    return result.teams;
  }, [queryPonder]);

  const getSuperheroById = useCallback(async (id: string) => {
    const query = `
      query GetSuperhero($id: String!) {
        superhero(id: $id) {
          id
          superheroId
          name
          bio
          avatarUrl
          reputation
          skills
          specialities
          flagged
          createdAt
          transactionHash
          blockNumber
        }
      }
    `;

    const result = await queryPonder(query, { id });
    return result.superhero;
  }, [queryPonder]);

  return {
    ...state,
    queryPonder,
    getSuperheroes,
    getIdeas,
    getTeams,
    getSuperheroById,
  };
};